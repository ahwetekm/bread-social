const { db } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');

const User = {
  async create({ username, email, password }) {
    const password_hash = await hashPassword(password);

    const result = await db.execute({
      sql: `
        INSERT INTO users (username, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `,
      args: [username.toLowerCase(), email.toLowerCase(), password_hash]
    });

    return this.findById(Number(result.lastInsertRowid));
  },

  async findById(id) {
    const result = await db.execute({
      sql: `
        SELECT id, username, email, display_name, bio, avatar_emoji, created_at, updated_at
        FROM users
        WHERE id = ? AND deleted_at IS NULL
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await db.execute({
      sql: `
        SELECT id, username, email, password_hash, display_name, bio, avatar_emoji, created_at, updated_at
        FROM users
        WHERE email = ? AND deleted_at IS NULL
      `,
      args: [email.toLowerCase()]
    });

    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await db.execute({
      sql: `
        SELECT id, username, email, password_hash, display_name, bio, avatar_emoji, created_at, updated_at
        FROM users
        WHERE username = ? AND deleted_at IS NULL
      `,
      args: [username.toLowerCase()]
    });

    return result.rows[0] || null;
  },

  async findByIdentifier(identifier) {
    // Check if it's an email or username
    const isEmail = identifier.includes('@');
    return isEmail ? this.findByEmail(identifier) : this.findByUsername(identifier);
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return comparePassword(plainPassword, hashedPassword);
  },

  async existsByUsername(username) {
    const result = await db.execute({
      sql: 'SELECT 1 FROM users WHERE username = ? AND deleted_at IS NULL',
      args: [username.toLowerCase()]
    });
    return result.rows.length > 0;
  },

  async existsByEmail(email) {
    const result = await db.execute({
      sql: 'SELECT 1 FROM users WHERE email = ? AND deleted_at IS NULL',
      args: [email.toLowerCase()]
    });
    return result.rows.length > 0;
  },

  sanitize(user) {
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
};

module.exports = User;
