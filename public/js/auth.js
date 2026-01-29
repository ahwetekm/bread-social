// Auth State Management
const Auth = {
  user: null,
  isAuthenticated: false,

  async init() {
    try {
      const response = await fetch('/api/v1/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.setUser(data.data.user);
      } else {
        this.clearUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.clearUser();
    }
  },

  setUser(user) {
    this.user = user;
    this.isAuthenticated = true;
    document.body.classList.add('authenticated');
    // Save user to localStorage for post ownership checks
    localStorage.setItem('user', JSON.stringify(user));
    this.updateUI();
  },

  clearUser() {
    this.user = null;
    this.isAuthenticated = false;
    document.body.classList.remove('authenticated');
    // Clear user from localStorage
    localStorage.removeItem('user');
    this.updateUI();
  },

  updateUI() {
    // Update profile section with user data if authenticated
    if (this.user) {
      const profileAvatar = document.querySelector('.profile-avatar-large');
      const profileName = document.querySelector('.profile-display-name');
      const profileUsername = document.querySelector('.profile-username');
      const newPostAvatar = document.querySelector('.new-post-avatar');
      const newPostUsername = document.querySelector('.new-post-username');

      if (profileAvatar) profileAvatar.textContent = this.user.avatar_emoji || '🧑';
      if (profileName) profileName.textContent = this.user.display_name || this.user.username;
      if (profileUsername) profileUsername.textContent = '@' + this.user.username;
      if (newPostAvatar) newPostAvatar.textContent = this.user.avatar_emoji || '🧑';
      if (newPostUsername) newPostUsername.textContent = this.user.display_name || this.user.username;

      // Update profile link to point to current user's profile
      const profileLink = document.getElementById('nav-profile-link');
      if (profileLink) {
        profileLink.href = `?username=${this.user.username}`;
      }
    }
  },

  async login(identifier, password) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Giris basarisiz');
    }

    this.setUser(data.data.user);
    return data;
  },

  async register(username, email, password) {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.details?.[0]?.message || data.error?.message || 'Kayit basarisiz';
      throw new Error(errorMsg);
    }

    return data;
  },

  async logout() {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.clearUser();
  }
};

// Modal Management
const AuthModals = {
  loginModal: null,
  registerModal: null,

  init() {
    this.loginModal = document.getElementById('login-modal');
    this.registerModal = document.getElementById('register-modal');

    this.setupEventListeners();
  },

  setupEventListeners() {
    // Open login modal buttons
    const loginTriggers = [
      document.getElementById('login-btn'),
      document.querySelector('.guest-bar-login'),
      document.getElementById('switch-to-login')
    ];

    loginTriggers.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeAll();
          this.openLogin();
        });
      }
    });

    // Open register modal buttons
    const registerTriggers = [
      document.getElementById('register-btn'),
      document.querySelector('.guest-bar-register'),
      document.getElementById('switch-to-register')
    ];

    registerTriggers.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeAll();
          this.openRegister();
        });
      }
    });

    // Close buttons
    document.querySelectorAll('.login-close, .register-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAll());
    });

    // Click overlay to close
    if (this.loginModal) {
      this.loginModal.querySelector('.modal-overlay')?.addEventListener('click', () => this.closeAll());
    }
    if (this.registerModal) {
      this.registerModal.querySelector('.modal-overlay')?.addEventListener('click', () => this.closeAll());
    }

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });

    // Form submissions
    document.getElementById('login-form')?.addEventListener('submit', this.handleLogin.bind(this));
    document.getElementById('register-form')?.addEventListener('submit', this.handleRegister.bind(this));
  },

  openLogin() {
    if (this.loginModal) {
      this.loginModal.classList.add('active');
      document.getElementById('login-identifier')?.focus();
    }
  },

  openRegister() {
    if (this.registerModal) {
      this.registerModal.classList.add('active');
      document.getElementById('register-username')?.focus();
    }
  },

  closeAll() {
    this.loginModal?.classList.remove('active');
    this.registerModal?.classList.remove('active');
    this.clearErrors();
    this.clearForms();
  },

  clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
    });
  },

  clearForms() {
    document.getElementById('login-form')?.reset();
    document.getElementById('register-form')?.reset();
  },

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorEl = document.getElementById('login-error');

    const identifier = form.identifier.value.trim();
    const password = form.password.value;

    if (!identifier || !password) {
      errorEl.textContent = 'Tum alanlari doldurun';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'GİRİŞ YAPILIYOR...';
    errorEl.textContent = '';

    try {
      await Auth.login(identifier, password);
      this.closeAll();
    } catch (error) {
      errorEl.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'GİRİŞ YAP';
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorEl = document.getElementById('register-error');

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    // Client-side validation
    if (!username || !email || !password) {
      errorEl.textContent = 'Tum alanlari doldurun';
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      errorEl.textContent = 'Kullanici adi 3-30 karakter, sadece harf, rakam ve alt cizgi';
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'Sifre en az 8 karakter olmali';
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errorEl.textContent = 'Sifre en az 1 harf ve 1 rakam icermeli';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'KAYIT OLUNUYOR...';
    errorEl.textContent = '';

    try {
      await Auth.register(username, email, password);
      // Auto-login after registration
      await Auth.login(email, password);
      this.closeAll();
    } catch (error) {
      errorEl.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'KAYIT OL';
    }
  }
};

// Initialize auth on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await Auth.init();
  AuthModals.init();
});

// Export for use in other scripts
window.Auth = Auth;
window.AuthModals = AuthModals;
