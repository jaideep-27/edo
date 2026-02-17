const experimentService = require('../services/experimentService');
const resultService = require('../services/resultService');
const optimizationService = require('../services/optimizationService');

/**
 * POST /api/experiments
 */
const create = async (req, res, next) => {
  try {
    const experiment = await experimentService.create(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: { experiment },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experiments
 */
const list = async (req, res, next) => {
  try {
    const { experiments, pagination } = await experimentService.list(
      req.user._id,
      req.query
    );
    res.json({
      success: true,
      data: { experiments },
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experiments/:id
 */
const getById = async (req, res, next) => {
  try {
    const experiment = await experimentService.getById(
      req.user._id,
      req.params.id
    );
    res.json({
      success: true,
      data: { experiment },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/experiments/:id
 */
const update = async (req, res, next) => {
  try {
    const experiment = await experimentService.update(
      req.user._id,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: { experiment },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/experiments/:id
 */
const remove = async (req, res, next) => {
  try {
    await resultService.removeByExperimentId(req.params.id);
    await experimentService.remove(req.user._id, req.params.id);
    res.json({
      success: true,
      data: { message: 'Experiment deleted' },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/experiments/:id/run
 * Kicks off the optimization pipeline asynchronously.
 */
const run = async (req, res, next) => {
  try {
    const experiment = await experimentService.queue(
      req.user._id,
      req.params.id
    );

    // Fire and forget — the client polls status or uses SSE later
    optimizationService.runExperiment(experiment).catch((err) => {
      console.error(
        `[ASYNC] Experiment ${experiment._id} failed:`,
        err.message
      );
    });

    res.json({
      success: true,
      data: {
        experiment,
        message: 'Experiment queued for execution',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, update, remove, run };
