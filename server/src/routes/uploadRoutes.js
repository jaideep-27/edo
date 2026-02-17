const { Router } = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

const router = Router();

// All routes require authentication
router.use(auth);

// ── File upload ────────────────────────────────────────
router.post('/upload/workload', upload.single('file'), uploadController.uploadWorkload);
router.post('/upload/vms', upload.single('file'), uploadController.uploadVMs);

// ── Presets ────────────────────────────────────────────
router.get('/presets', uploadController.getPresets);
router.get('/presets/workload/:presetId', uploadController.getWorkloadPreset);
router.get('/presets/vm/:presetId', uploadController.getVMPreset);

module.exports = router;
