const { Router } = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const resultController = require('../controllers/resultController');

const router = Router();

// All result routes require authentication
router.use(auth);

router.get(
  '/experiments/:id/result',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  resultController.getResult
);

router.get(
  '/experiments/:id/result/export',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  resultController.exportResult
);

router.post(
  '/results/compare',
  [
    body('experimentIds')
      .isArray({ min: 2, max: 10 })
      .withMessage('Provide 2-10 experiment IDs'),
    body('experimentIds.*')
      .isMongoId()
      .withMessage('Each experiment ID must be valid'),
  ],
  validate,
  resultController.compare
);

module.exports = router;
