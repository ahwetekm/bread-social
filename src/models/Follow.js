const { db } = require('../config/database');

const Follow = {
  async create({ followerId, followingId }) {
    const result = await db.execute({
      sql: `
        INSERT INTO follows (follower_id, following_id, created_at)
        VALUES (?, ?, datetime('now'))
      `,
      args: [followerId, followingId]
    });

    return this.findById(Number(result.lastInsertRowid));
  },

  async findById(id) {
    const result = await db.execute({
      sql: `
        SELECT 
          f.id,
          f.follower_id,
          f.following_id,
          f.created_at,
          fu.username as follower_username,
          fu.display_name as follower_display_name,
          fu.avatar_emoji as follower_avatar,
          u.username as following_username,
          u.display_name as following_display_name,
          u.avatar_emoji as following_avatar
        FROM follows f
        JOIN users fu ON f.follower_id = fu.id
        JOIN users u ON f.following_id = u.id
        WHERE f.id = ?
      `,
      args: [id]
    });

    return result.rows[0] || null;
  },

  async findByFollowerAndFollowing(followerId, followingId) {
    const result = await db.execute({
      sql: 'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      args: [followerId, followingId]
    });
    return result.rows[0] || null;
  },

  async getFollowers(userId, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.avatar_emoji,
          u.bio,
          f.created_at as followed_at
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [userId, limit, offset]
    });
    return result.rows;
  },

  async getFollowing(userId, limit = 20, offset = 0) {
    const result = await db.execute({
      sql: `
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.avatar_emoji,
          u.bio,
          f.created_at as followed_at
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [userId, limit, offset]
    });
    return result.rows;
  },

  async delete(followerId, followingId) {
    await db.execute({
      sql: `
        DELETE FROM follows
        WHERE follower_id = ? AND following_id = ?
      `,
      args: [followerId, followingId]
    });
  },

  async isFollowing(followerId, followingId) {
    const result = await db.execute({
      sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      args: [followerId, followingId]
    });
    return result.rows.length > 0;
  },

  async countFollowers(userId) {
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

  async countFollowing(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM follows
        WHERE follower_id = ?
      `,
      args: [userId]
    });
    return result.rows[0].count;
  }
};

module.exports = Follow;
