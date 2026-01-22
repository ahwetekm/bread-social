const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};

const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if username exists
      if (await User.existsByUsername(username)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Bu kullanici adi zaten kullaniliyor',
            details: [{ field: 'username', message: 'Bu kullanici adi zaten kullaniliyor' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if email exists
      if (await User.existsByEmail(email)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Bu e-posta adresi zaten kullaniliyor',
            details: [{ field: 'email', message: 'Bu e-posta adresi zaten kullaniliyor' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      // Create user
      const user = await User.create({ username, email, password });

      res.status(201).json({
        success: true,
        data: {
          user: User.sanitize(user)
        },
        message: 'Kayit basarili',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async login(req, res) {
    try {
      const { identifier, password } = req.body;

      // Find user by email or username
      const user = await User.findByIdentifier(identifier);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'E-posta veya sifre hatali'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'E-posta veya sifre hatali'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Generate tokens
      const tokenPayload = { userId: user.id, username: user.username };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Set cookies
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: User.sanitize(user)
        },
        message: 'Giris basarili',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async me(req, res) {
    res.json({
      success: true,
      data: {
        user: req.user
      },
      timestamp: new Date().toISOString()
    });
  },

  async logout(req, res) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    res.json({
      success: true,
      message: 'Cikis yapildi',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authController;
