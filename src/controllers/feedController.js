const Feed = require('../models/Feed');

const feedController = {
  async getFeed(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const posts = await Feed.getFeed(userId, limit, offset);
      const total = await Feed.countFeed(userId);

      res.json({
        success: true,
        data: { posts },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = feedController;
