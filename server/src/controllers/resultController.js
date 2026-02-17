const resultService = require('../services/resultService');
const experimentService = require('../services/experimentService');

/**
 * GET /api/experiments/:id/result
 */
const getResult = async (req, res, next) => {
  try {
    // Verify experiment belongs to user
    await experimentService.getById(req.user._id, req.params.id);
    const result = await resultService.getByExperimentId(req.params.id);

    res.json({
      success: true,
      data: { result },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/results/compare
 * Body: { experimentIds: string[] }
 */
const compare = async (req, res, next) => {
  try {
    const { experimentIds } = req.body;

    // Verify all experiments belong to user
    await Promise.all(
      experimentIds.map((id) => experimentService.getById(req.user._id, id))
    );

    const results = await resultService.getByExperimentIds(experimentIds);

    res.json({
      success: true,
      data: { results },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experiments/:id/result/export
 */
const exportResult = async (req, res, next) => {
  try {
    await experimentService.getById(req.user._id, req.params.id);
    const exported = await resultService.exportResult(req.params.id);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=result-${req.params.id}.json`
    );
    res.json(exported);
  } catch (err) {
    next(err);
  }
};

module.exports = { getResult, compare, exportResult };
