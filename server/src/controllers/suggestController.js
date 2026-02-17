const suggestService = require('../services/suggestService');

/**
 * POST /api/suggest
 * Body: { workloadConfig, vmConfig }
 */
const getSuggestion = async (req, res, next) => {
  try {
    const { workloadConfig, vmConfig } = req.body;

    if (!workloadConfig || !vmConfig) {
      return res.status(400).json({
        success: false,
        error: { message: 'workloadConfig and vmConfig are required' },
      });
    }

    const suggestion = suggestService.suggest(workloadConfig, vmConfig);

    res.json({
      success: true,
      data: { suggestion },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSuggestion };
