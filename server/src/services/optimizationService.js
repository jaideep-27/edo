const { spawn } = require('child_process');
const path = require('path');
const config = require('../config/env');
const logger = require('../utils/logger');
const experimentService = require('./experimentService');
const resultService = require('./resultService');

/**
 * Run the Python optimizer as a child process.
 * Sends experiment config via stdin JSON, reads result from stdout JSON.
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
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.error('Optimizer process failed', {
          code,
          stderr,
          experimentId: experiment._id,
        });
        return reject(new Error(`Optimizer exited with code ${code}: ${stderr}`));
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
 */
const runExperiment = async (experiment) => {
  try {
    await experimentService.updateStatus(experiment._id, 'running');

    const startTime = Date.now();
    const rawResult = await runOptimizer(experiment);
    const executionTime = Date.now() - startTime;

    const savedResult = await resultService.save(experiment._id, {
      makespan: rawResult.makespan,
      energy: rawResult.energy,
      reliability: rawResult.reliability,
      resourceUtilization: rawResult.resourceUtilization,
      convergenceData: rawResult.convergenceData || [],
      paretoPoints: rawResult.paretoPoints || [],
      schedule: rawResult.schedule || [],
      rawLogs: rawResult.logs || '',
      executionTime,
    });

    await experimentService.updateStatus(experiment._id, 'completed');
    logger.info('Experiment completed', {
      experimentId: experiment._id,
      executionTime,
    });

    return savedResult;
  } catch (err) {
    await experimentService.updateStatus(experiment._id, 'failed');
    logger.error('Experiment failed', {
      experimentId: experiment._id,
      error: err.message,
    });
    throw err;
  }
};

module.exports = { runOptimizer, runExperiment };
