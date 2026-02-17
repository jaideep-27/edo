const Result = require('../models/Result');

/**
 * Save a result for an experiment.
 */
const save = async (experimentId, data) => {
  // Remove any previous result for this experiment
  await Result.deleteMany({ experimentId });
  const result = await Result.create({ ...data, experimentId });
  return result;
};

/**
 * Get the result for a given experiment.
 */
const getByExperimentId = async (experimentId) => {
  const result = await Result.findOne({ experimentId });
  if (!result) {
    const err = new Error('Result not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return result;
};

/**
 * Get results for multiple experiments (for comparison).
 */
const getByExperimentIds = async (experimentIds) => {
  const results = await Result.find({
    experimentId: { $in: experimentIds },
  });
  return results;
};

/**
 * Delete results for an experiment.
 */
const removeByExperimentId = async (experimentId) => {
  await Result.deleteMany({ experimentId });
};

/**
 * Export result as a flat JSON summary for download.
 */
const exportResult = async (experimentId) => {
  const result = await getByExperimentId(experimentId);
  return {
    experimentId: result.experimentId,
    metrics: {
      makespan: result.makespan,
      energy: result.energy,
      reliability: result.reliability,
      resourceUtilization: result.resourceUtilization,
    },
    convergenceData: result.convergenceData,
    paretoPoints: result.paretoPoints,
    schedule: result.schedule,
    executionTime: result.executionTime,
    createdAt: result.createdAt,
  };
};

module.exports = {
  save,
  getByExperimentId,
  getByExperimentIds,
  removeByExperimentId,
  exportResult,
};
