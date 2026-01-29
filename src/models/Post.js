const { db } = require('../config/database');

const Post = {
  async create({ userId, content }) {
    const result = await db.execute({
      sql: `
        INSERT INTO posts (user_id, content, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `,
      args: [userId, content]
    });

    return this.findById(Number(result.lastInsertRowid));
  },

  async findById(id) {
    const result = await db.execute({
      sql: `
        SELECT 
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) as comment_count,
          (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) as repost_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ? AND p.deleted_at IS NULL
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByUserId(userId, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) as comment_count,
          (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) as repost_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ? AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [userId, limit, offset]
    });

    return result.rows;
  },

  async findAll(limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) as comment_count,
          (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) as repost_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [limit, offset]
    });

    return result.rows;
  },

  async update(id, { content }) {
    await db.execute({
      sql: `
        UPDATE posts
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
        UPDATE posts
        SET deleted_at = datetime('now')
        WHERE id = ?
      `,
      args: [id]
    });
  },

  async countByUserId(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM posts
        WHERE user_id = ? AND deleted_at IS NULL
      `,
      args: [userId]
    });

    return result.rows[0].count;
  },

  async countAll() {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM posts
        WHERE deleted_at IS NULL
      `
    });

    return result.rows[0].count;
  },

  async searchPosts(query, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          u.username,
          u.display_name,
          u.avatar_emoji,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) as comment_count,
          (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) as repost_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL
          AND (p.content LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
    });

    return result.rows;
  },

  async countSearchPosts(query) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL
          AND (p.content LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)
      `,
      args: [`%${query}%`, `%${query}%`, `%${query}%`]
    });

    return result.rows[0].count;
  }
};

module.exports = Post;
