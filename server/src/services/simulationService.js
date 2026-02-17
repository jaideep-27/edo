const { spawn } = require('child_process');
const path = require('path');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Run the CloudSim Java simulation as a child process.
 * Sends schedule + VM config via stdin JSON, reads metrics from stdout JSON.
 *
 * @param {object} params
 * @param {string} params.experimentId
 * @param {Array}  params.schedule — task-to-VM mapping from optimizer
 * @param {object} params.vmConfig — VM configuration
 * @returns {Promise<object>} — simulation metrics
 */
const runSimulation = (params) => {
  return new Promise((resolve, reject) => {
    const jarPath =
      config.cloudsimJarPath ||
      path.resolve(__dirname, '..', '..', '..', 'simulator', 'target', 'simulator.jar');

    const payload = JSON.stringify({
      experimentId: params.experimentId,
      schedule: params.schedule,
      vmConfig: params.vmConfig,
    });

    logger.info('Starting CloudSim simulation', {
      experimentId: params.experimentId,
      jar: jarPath,
    });

    const proc = spawn('java', ['-jar', jarPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.resolve(__dirname, '..', '..', '..', 'simulator'),
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
        logger.error('Simulation process failed', {
          code,
          stderr,
          experimentId: params.experimentId,
        });
        return reject(
          new Error(`Simulation exited with code ${code}: ${stderr}`)
        );
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseErr) {
        logger.error('Failed to parse simulation output', {
          stdout,
          experimentId: params.experimentId,
        });
        reject(new Error('Failed to parse simulation output'));
      }
    });

    proc.on('error', (err) => {
      logger.error('Simulation process error', err);
      reject(err);
    });

    proc.stdin.write(payload);
    proc.stdin.end();
  });
};

module.exports = { runSimulation };
