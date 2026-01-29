const { db } = require('../config/database');

const Like = {
  async create({ userId, postId }) {
    const result = await db.execute({
      sql: `
        INSERT INTO likes (user_id, post_id, created_at)
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
          l.id,
          l.user_id,
          l.post_id,
          l.created_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = ?
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByUserAndPost(userId, postId) {
    const result = await db.execute({
      sql: `
        SELECT *
        FROM likes
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
          l.id,
          l.user_id,
          l.post_id,
          l.created_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.post_id = ?
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [postId, limit, offset]
    });

    return result.rows;
  },

  async delete(id) {
    await db.execute({
      sql: `
        DELETE FROM likes
        WHERE id = ?
      `,
      args: [id]
    });
  },

  async deleteByUserAndPost(userId, postId) {
    await db.execute({
      sql: `
        DELETE FROM likes
        WHERE user_id = ? AND post_id = ?
      `,
      args: [userId, postId]
    });
  },

  async countByPostId(postId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM likes
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
        FROM likes
        WHERE user_id = ?
      `,
      args: [userId]
    });

    return result.rows[0].count;
  }
};

module.exports = Like;
