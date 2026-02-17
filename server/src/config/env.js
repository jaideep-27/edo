const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root (3 levels up from server/src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  pythonPath: process.env.PYTHON_PATH || 'python3',
  cloudsimJarPath:
    process.env.CLOUDSIM_JAR_PATH ||
    path.resolve(__dirname, '../../../simulator/cloudsim.jar'),
  defaultSeed: parseInt(process.env.DEFAULT_SEED, 10) || 42,
};
