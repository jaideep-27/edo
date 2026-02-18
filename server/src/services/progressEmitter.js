/**
 * In-memory event emitter for streaming optimizer progress via SSE.
 *
 * Architecture:
 *   Python optimizer → stderr JSON lines → optimizationService parses →
 *   progressEmitter.emit() → SSE route pushes to connected clients
 */
const { EventEmitter } = require('events');

class ProgressEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // support many concurrent viewers
  }

  /**
   * Emit a progress update for a specific experiment.
   * @param {string} experimentId
   * @param {object} data — { phase, iteration, maxIterations, fitness, makespan, energy, reliability, utilization }
   */
  sendProgress(experimentId, data) {
    this.emit(`progress:${experimentId}`, {
      type: 'progress',
      timestamp: Date.now(),
      ...data,
    });
  }

  /**
   * Emit a phase change event.
   * @param {string} experimentId
   * @param {string} phase — 'queued' | 'initializing' | 'optimizing' | 'simulating' | 'saving' | 'completed' | 'failed'
   */
  sendPhase(experimentId, phase, meta = {}) {
    this.emit(`progress:${experimentId}`, {
      type: 'phase',
      phase,
      timestamp: Date.now(),
      ...meta,
    });
  }

  /**
   * Emit completion event with final metrics.
   */
  sendComplete(experimentId, metrics = {}) {
    this.emit(`progress:${experimentId}`, {
      type: 'complete',
      timestamp: Date.now(),
      ...metrics,
    });
  }

  /**
   * Emit failure event.
   */
  sendError(experimentId, message) {
    this.emit(`progress:${experimentId}`, {
      type: 'error',
      message,
      timestamp: Date.now(),
    });
  }
}

// Singleton
module.exports = new ProgressEmitter();
