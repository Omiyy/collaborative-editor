const { verifyToken } = require('../utils/jwt');

const extractTokenFromCookieHeader = (cookieHeader = '') => {
  const tokenPair = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('jwt_token='));

  if (!tokenPair) return null;
  return decodeURIComponent(tokenPair.substring('jwt_token='.length));
};

const authMiddleware = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    const cookieToken = extractTokenFromCookieHeader(req.headers.cookie);
    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
