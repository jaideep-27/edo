const { Router } = require('express');
const auth = require('../middleware/auth');
const suggestController = require('../controllers/suggestController');

const router = Router();

router.use(auth);

router.post('/suggest', suggestController.getSuggestion);

module.exports = router;
