const { db } = require('../config/database');

const Repost = {
  async create({ userId, postId }) {
    const result = await db.execute({
      sql: `
        INSERT INTO reposts (user_id, post_id, created_at)
        VALUES (?, ?, datetime('now'))
      `,
      args: [userId, postId]
    });

    return this.findById(Number(result.lastInsertRowid));
  },

  async findById(id) {
    const result = await db.execute({
      sql: `
        SELECT 
          r.id,
          r.user_id,
          r.post_id,
          r.created_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM reposts r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByUserAndPost(userId, postId) {
    const result = await db.execute({
      sql: `
        SELECT *
        FROM reposts
        WHERE user_id = ? AND post_id = ?
      `,
      args: [userId, postId]
    });

    return result.rows[0] || null;
  },

  async findByPostId(postId, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          r.id,
          r.user_id,
          r.post_id,
          r.created_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM reposts r
        JOIN users u ON r.user_id = u.id
        WHERE r.post_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [postId, limit, offset]
    });

    return result.rows;
  },

  async delete(id) {
    await db.execute({
      sql: `
        DELETE FROM reposts
        WHERE id = ?
      `,
      args: [id]
    });
  },

  async deleteByUserAndPost(userId, postId) {
    await db.execute({
      sql: `
        DELETE FROM reposts
        WHERE user_id = ? AND post_id = ?
      `,
      args: [userId, postId]
    });
  },

  async countByPostId(postId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM reposts
        WHERE post_id = ?
      `,
      args: [postId]
    });

    return result.rows[0].count;
  },

  async countByUserId(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM reposts
        WHERE user_id = ?
      `,
      args: [userId]
    });

    return result.rows[0].count;
  }
};

module.exports = Repost;
