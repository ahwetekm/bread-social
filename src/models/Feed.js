const { db } = require('../config/database');

const Feed = {
  async getFeed(userId, limit = 20, offset = 0) {
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
        AND (
          p.user_id = ?
          OR p.user_id IN (
            SELECT following_id FROM follows WHERE follower_id = ?
          )
        )
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [userId, userId, limit, offset]
    });
    return result.rows;
  },

  async countFeed(userId) {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM posts p
        WHERE p.deleted_at IS NULL
        AND (
          p.user_id = ?
          OR p.user_id IN (
            SELECT following_id FROM follows WHERE follower_id = ?
          )
        )
      `,
      args: [userId, userId]
    });
    return result.rows[0].count;
  }
};

module.exports = Feed;
