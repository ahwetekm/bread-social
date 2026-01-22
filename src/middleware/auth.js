const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Oturum acmaniz gerekiyor'
      },
      timestamp: new Date().toISOString()
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Gecersiz veya suresi dolmus oturum'
      },
      timestamp: new Date().toISOString()
    });
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Kullanici bulunamadi'
      },
      timestamp: new Date().toISOString()
    });
  }

  req.user = User.sanitize(user);
  next();
};

const optionalAuth = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = User.sanitize(user);
      }
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth };
