const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Generate a JWT for the given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password, // Pre-save hook hashes it
  });

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

/**
 * Authenticate a user with email + password.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

module.exports = { register, login, generateToken };
