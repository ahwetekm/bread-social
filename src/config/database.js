const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const initDatabase = async () => {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(50),
        bio TEXT,
        avatar_emoji VARCHAR(10) DEFAULT '🧑',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    // Create posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create follows table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_id, following_id)
      )
    `);

    // Create likes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
      )
    `);

    // Create comments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);

    // Create reposts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reposts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
      )
    `);

    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_reposts_post_id ON reposts(post_id)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { db, initDatabase };
