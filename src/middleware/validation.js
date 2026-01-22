const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username) {
    errors.push({ field: 'username', message: 'Kullanici adi zorunlu' });
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    errors.push({
      field: 'username',
      message: 'Kullanici adi 3-30 karakter, sadece harf, rakam ve alt cizgi icermeli'
    });
  }

  // Email validation
  if (!email) {
    errors.push({ field: 'email', message: 'E-posta zorunlu' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Gecerli bir e-posta adresi girin' });
  }

  // Password validation
  if (!password) {
    errors.push({ field: 'password', message: 'Sifre zorunlu' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Sifre en az 8 karakter olmali' });
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'Sifre en az 1 harf ve 1 rakam icermeli' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Gecersiz veri',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  const errors = [];

  if (!identifier) {
    errors.push({ field: 'identifier', message: 'E-posta veya kullanici adi zorunlu' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Sifre zorunlu' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Gecersiz veri',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
