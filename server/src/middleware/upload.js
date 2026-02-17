const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and JSON files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
