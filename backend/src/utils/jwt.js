const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT secret is missing. Set JWT_SECRET_KEY (preferred) or JWT_SECRET.');
  }

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT secret is too short for production. Use at least 32 characters.');
  }

  return secret;
};

const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

const setTokenCookie = (res, token) => {
  res.cookie('jwt_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = {
  generateToken,
  verifyToken,
  getJwtSecret,
  setTokenCookie,
};
