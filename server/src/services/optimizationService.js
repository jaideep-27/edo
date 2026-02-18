const { spawn } = require('child_process');
const path = require('path');
const config = require('../config/env');
const logger = require('../utils/logger');
const experimentService = require('./experimentService');
const resultService = require('./resultService');
const simulationService = require('./simulationService');
const progressEmitter = require('./progressEmitter');

/**
 * Run the Python optimizer as a child process.
 * Sends experiment config via stdin JSON, reads result from stdout JSON.
 * Parses stderr for PROGRESS: lines and emits them via progressEmitter.
 *
 * @param {object} experiment — full Mongoose experiment document
 * @returns {Promise<object>} — parsed result from Python
 */
const runOptimizer = (experiment) => {
  return new Promise((resolve, reject) => {
    const pythonPath = config.pythonPath || 'python3';
    const scriptPath = path.resolve(
      __dirname,
      '..', '..', '..', 'optimizer', 'main.py'
    );

    const payload = JSON.stringify({
      experimentId: experiment._id.toString(),
      algorithm: experiment.algorithm,
      workloadConfig: experiment.workloadConfig,
      vmConfig: experiment.vmConfig,
      hyperparameters: experiment.hyperparameters,
      seed: config.defaultSeed,
    });

    logger.info('Starting optimizer process', {
      experimentId: experiment._id,
      algorithm: experiment.algorithm,
      script: scriptPath,
    });

    const proc = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.resolve(__dirname, '..', '..', '..', 'optimizer'),
    });

    let stdout = '';
    let stderrBuf = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderrBuf += data.toString();

      // Parse complete lines for PROGRESS: prefixed JSON
      const lines = stderrBuf.split('\n');
      // Keep the last incomplete line in the buffer
      stderrBuf = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('PROGRESS:')) {
          try {
            const progressData = JSON.parse(line.slice('PROGRESS:'.length));
            progressEmitter.sendProgress(experiment._id.toString(), progressData);
          } catch {
            // Ignore malformed progress lines
          }
        }
      }
    });

    proc.on('close', (code) => {
      // Process any remaining buffer
      if (stderrBuf.startsWith('PROGRESS:')) {
        try {
          const progressData = JSON.parse(stderrBuf.slice('PROGRESS:'.length));
          progressEmitter.sendProgress(experiment._id.toString(), progressData);
        } catch {
          // ignore
        }
      }

      if (code !== 0) {
        // Filter out PROGRESS lines from error stderr
        const errorLines = (stderrBuf + '\n' + stdout)
          .split('\n')
          .filter((l) => !l.startsWith('PROGRESS:'))
          .join('\n')
          .trim();
        logger.error('Optimizer process failed', {
          code,
          stderr: errorLines,
          experimentId: experiment._id,
        });
        return reject(new Error(`Optimizer exited with code ${code}: ${errorLines}`));
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseErr) {
        logger.error('Failed to parse optimizer output', {
          stdout,
          experimentId: experiment._id,
        });
        reject(new Error('Failed to parse optimizer output'));
      }
    });

    proc.on('error', (err) => {
      logger.error('Optimizer process error', err);
      reject(err);
    });

    // Send experiment config to stdin
    proc.stdin.write(payload);
    proc.stdin.end();
  });
};

/**
 * Full optimization pipeline: update status → run → save result.
 * Emits phase/progress events via SSE throughout the pipeline.
 */
const runExperiment = async (experiment) => {
  const expId = experiment._id.toString();

  try {
    await experimentService.updateStatus(experiment._id, 'running');
    progressEmitter.sendPhase(expId, 'initializing', {
      algorithm: experiment.algorithm,
      maxIterations: experiment.hyperparameters?.maxIterations ?? 100,
      taskCount: experiment.workloadConfig?.taskCount ?? 0,
      vmCount: experiment.vmConfig?.vmCount ?? 0,
    });

    const startTime = Date.now();

    // Phase 1: Run Python optimizer
    progressEmitter.sendPhase(expId, 'optimizing');
    const rawResult = await runOptimizer(experiment);
    const optimizerTime = Date.now() - startTime;
    logger.info('Optimizer finished', {
      experimentId: experiment._id,
      optimizerTime,
    });

    // Phase 2: Run CloudSim simulation (optional — skip if no schedule or JAR missing)
    let simResult = null;
    if (rawResult.schedule?.length > 0) {
      try {
        progressEmitter.sendPhase(expId, 'simulating');
        simResult = await simulationService.runSimulation({
          experimentId: experiment._id.toString(),
          schedule: rawResult.schedule,
          vmConfig: experiment.vmConfig,
        });
        logger.info('CloudSim simulation finished', {
          experimentId: experiment._id,
          simMakespan: simResult.makespan,
        });
      } catch (simErr) {
        // Simulation is non-fatal — use optimizer results as fallback
        logger.warn('CloudSim simulation failed, using optimizer results', {
          experimentId: experiment._id,
          error: simErr.message,
        });
      }
    }

    // Phase 3: Save results
    progressEmitter.sendPhase(expId, 'saving');

    const executionTime = Date.now() - startTime;

    // Merge: prefer CloudSim metrics when available, fall back to optimizer
    const finalMakespan = simResult?.makespan ?? rawResult.makespan;
    const finalEnergy = simResult?.energy ?? rawResult.energy;
    const finalUtilization = simResult?.resourceUtilization != null
      ? simResult.resourceUtilization * 100  // CloudSim returns 0-1 ratio
      : rawResult.resourceUtilization;
    const finalSchedule = simResult?.taskResults ?? rawResult.schedule ?? [];

    const savedResult = await resultService.save(experiment._id, {
      makespan: finalMakespan,
      energy: finalEnergy,
      reliability: rawResult.reliability,
      resourceUtilization: finalUtilization,
      convergenceData: (rawResult.convergenceData || []).map((pt) => ({
        iteration: pt.iteration,
        fitness: pt.bestFitness ?? pt.fitness,
        makespan: pt.makespan,
        energy: pt.energy,
      })),
      paretoPoints: rawResult.paretoPoints || [],
      schedule: finalSchedule,
      rawLogs: rawResult.logs || '',
      executionTime,
    });

    await experimentService.updateStatus(experiment._id, 'completed');

    progressEmitter.sendComplete(expId, {
      makespan: finalMakespan,
      energy: finalEnergy,
      reliability: rawResult.reliability,
      resourceUtilization: finalUtilization,
      executionTime,
    });

    logger.info('Experiment completed', {
      experimentId: experiment._id,
      executionTime,
    });

    return savedResult;
  } catch (err) {
    await experimentService.updateStatus(experiment._id, 'failed');
    progressEmitter.sendError(expId, err.message);
    logger.error('Experiment failed', {
      experimentId: experiment._id,
      error: err.message,
    });
    throw err;
  }
};

module.exports = { runOptimizer, runExperiment };
