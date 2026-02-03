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

  async getFollowersCount(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM follows
        WHERE following_id = ?
      `,
      args: [userId]
    });

    return result.rows[0].count;
  },

  async getFollowingCount(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM follows
        WHERE follower_id = ?
      `,
      args: [userId]
    });

    return result.rows[0].count;
  },

  async getProfileStats(userId) {
    const followersCount = await this.getFollowersCount(userId);
    const followingCount = await this.getFollowingCount(userId);

    const Post = require('./Post');
    const postsCount = await Post.countByUserId(userId);

    return {
      posts_count: postsCount,
      followers_count: followersCount,
      following_count: followingCount
    };
  },

  async update(id, { display_name, bio, avatar_emoji }) {
    const updates = [];
    const args = [];

    if (display_name !== undefined) {
      updates.push('display_name = ?');
      args.push(display_name);
    }

    if (bio !== undefined) {
      updates.push('bio = ?');
      args.push(bio);
    }

    if (avatar_emoji !== undefined) {
      updates.push('avatar_emoji = ?');
      args.push(avatar_emoji);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = datetime(\'now\')');
    args.push(id);

    await db.execute({
      sql: `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ? AND deleted_at IS NULL
      `,
      args
    });

    return this.findById(id);
  },

  sanitize(user) {
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async searchUsers(query, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          id,
          username,
          display_name,
          bio,
          avatar_emoji,
          created_at,
          updated_at
        FROM users
        WHERE deleted_at IS NULL
          AND (username LIKE ? OR display_name LIKE ?)
        ORDER BY username ASC
        LIMIT ? OFFSET ?
      `,
      args: [`%${query}%`, `%${query}%`, limit, offset]
    });

    return result.rows;
  },

  async countSearchUsers(query) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL
          AND (username LIKE ? OR display_name LIKE ?)
      `,
      args: [`%${query}%`, `%${query}%`]
    });

    return result.rows[0].count;
  }
};

module.exports = User;
