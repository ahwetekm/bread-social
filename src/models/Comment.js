const { db } = require('../config/database');

const Comment = {
  async create({ userId, postId, content }) {
    const result = await db.execute({
      sql: `
        INSERT INTO comments (user_id, post_id, content, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `,
      args: [userId, postId, content]
    });

    return this.findById(Number(result.lastInsertRowid));
  },

  async findById(id) {
    const result = await db.execute({
      sql: `
        SELECT 
          c.id,
          c.user_id,
          c.post_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ? AND c.deleted_at IS NULL
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByPostId(postId, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          c.id,
          c.user_id,
          c.post_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `,
      args: [postId, limit, offset]
    });

    return result.rows;
  },

  async update(id, { content }) {
    await db.execute({
      sql: `
        UPDATE comments
        SET content = ?, updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NULL
      `,
      args: [content, id]
    });

    return this.findById(id);
  },

  async delete(id) {
    await db.execute({
      sql: `
        UPDATE comments
        SET deleted_at = datetime('now')
        WHERE id = ?
      `,
      args: [id]
    });
  },

  async countByPostId(postId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM comments
        WHERE post_id = ? AND deleted_at IS NULL
      `,
      args: [postId]
    });

    return result.rows[0].count;
  },

  async countByUserId(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM comments
        WHERE user_id = ? AND deleted_at IS NULL
      `,
      args: [userId]
    });

    return result.rows[0].count;
  }
};

module.exports = Comment;
