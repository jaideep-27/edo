const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const experimentController = require('../controllers/experimentController');

const router = Router();

// All experiment routes require authentication
router.use(auth);

const ALGORITHMS = ['EDO', 'PSO', 'ACO', 'GA', 'WOA', 'ROUND_ROBIN', 'MIN_MIN', 'MAX_MIN'];

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Experiment name is required')
      .isLength({ max: 200 })
      .withMessage('Name must be at most 200 characters'),
    body('algorithm')
      .isIn(ALGORITHMS)
      .withMessage(`Algorithm must be one of: ${ALGORITHMS.join(', ')}`),
    body('workloadConfig.taskCount')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Task count must be between 1 and 10000'),
    body('vmConfig.vmCount')
      .isInt({ min: 1, max: 1000 })
      .withMessage('VM count must be between 1 and 1000'),
  ],
  validate,
  experimentController.create
);

router.get('/', experimentController.list);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  experimentController.getById
);

router.put(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  experimentController.update
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  experimentController.remove
);

router.post(
  '/:id/run',
  [param('id').isMongoId().withMessage('Invalid experiment ID')],
  validate,
  experimentController.run
);

module.exports = router;
