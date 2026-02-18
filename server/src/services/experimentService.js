const Experiment = require('../models/Experiment');
const Result = require('../models/Result');

/**
 * Create a new experiment owned by the given user.
 */
const create = async (userId, data) => {
  const experiment = await Experiment.create({ ...data, userId });
  return experiment;
};

/**
 * List all experiments for a given user with optional filters.
 * @param {string} userId
 * @param {{ status?: string, algorithm?: string, page?: number, limit?: number, sort?: string }} query
 */
const list = async (userId, query = {}) => {
  const {
    status,
    algorithm,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = query;

  const filter = { userId };
  if (status) filter.status = status;
  if (algorithm) filter.algorithm = algorithm;

  const skip = (page - 1) * limit;

  const [experiments, total] = await Promise.all([
    Experiment.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Experiment.countDocuments(filter),
  ]);

  return {
    experiments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single experiment by ID (must belong to user).
 */
const getById = async (userId, experimentId) => {
  const experiment = await Experiment.findOne({
    _id: experimentId,
    userId,
  });

  if (!experiment) {
    const err = new Error('Experiment not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return experiment;
};

/**
 * Update an experiment. Only allowed if status is 'draft'.
 */
const update = async (userId, experimentId, data) => {
  const experiment = await getById(userId, experimentId);

  if (experiment.status !== 'draft') {
    const err = new Error('Cannot edit a non-draft experiment');
    err.statusCode = 400;
    err.code = 'INVALID_STATUS';
    throw err;
  }

  Object.assign(experiment, data);
  await experiment.save();
  return experiment;
};

/**
 * Delete an experiment and its results.
 */
const remove = async (userId, experimentId) => {
  const experiment = await getById(userId, experimentId);
  await experiment.deleteOne();
  // Results will be cleaned up in the controller
  return { deleted: true };
};

/**
 * Mark experiment as queued for running.
 * Allows both 'draft' and 'failed' experiments to be (re-)queued.
 */
const queue = async (userId, experimentId) => {
  const experiment = await getById(userId, experimentId);

  if (experiment.status !== 'draft' && experiment.status !== 'failed') {
    const err = new Error('Only draft or failed experiments can be queued');
    err.statusCode = 400;
    err.code = 'INVALID_STATUS';
    throw err;
  }

  // Clean up any previous results when retrying a failed experiment
  if (experiment.status === 'failed') {
    await Result.deleteMany({ experimentId: experiment._id });
  }

  experiment.status = 'queued';
  await experiment.save();
  return experiment;
};

/**
 * Update experiment status (used internally by optimization/simulation services).
 * Sets startedAt when transitioning to 'running'.
 */
const updateStatus = async (experimentId, status) => {
  const update = { status };
  if (status === 'running') {
    update.startedAt = new Date();
  }
  const experiment = await Experiment.findByIdAndUpdate(
    experimentId,
    update,
    { returnDocument: 'after' }
  );
  return experiment;
};

module.exports = { create, list, getById, update, remove, queue, updateStatus };
