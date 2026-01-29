const Like = require('../models/Like');

const likeController = {
  async create(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Check if already liked
      const existingLike = await Like.findByUserAndPost(userId, postId);
      if (existingLike) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_LIKED',
            message: 'Bu postu zaten beğendiniz'
          },
          timestamp: new Date().toISOString()
        });
      }

      const like = await Like.create({ userId, postId });

      res.status(201).json({
        success: true,
        data: { like },
        message: 'Post beğenildi',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create like error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async delete(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Check if like exists
      const existingLike = await Like.findByUserAndPost(userId, postId);
      if (!existingLike) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Beğeni bulunamadı'
          },
          timestamp: new Date().toISOString()
        });
      }

      await Like.deleteByUserAndPost(userId, postId);

      res.status(200).json({
        success: true,
        message: 'Beğeni kaldırıldı',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Delete like error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async getByPostId(req, res) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const likes = await Like.findByPostId(postId, limit, offset);
      const total = await Like.countByPostId(postId);

      res.json({
        success: true,
        data: { likes },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get likes error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async checkUserLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const like = await Like.findByUserAndPost(userId, postId);

      res.json({
        success: true,
        data: { liked: !!like },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Check like error:', error);
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

module.exports = likeController;
