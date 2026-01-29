const Repost = require('../models/Repost');

const repostController = {
  async create(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Check if already reposted
      const existingRepost = await Repost.findByUserAndPost(userId, postId);
      if (existingRepost) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_REPOSTED',
            message: 'Bu postu zaten paylaştınız'
          },
          timestamp: new Date().toISOString()
        });
      }

      const repost = await Repost.create({ userId, postId });

      res.status(201).json({
        success: true,
        data: { repost },
        message: 'Post paylaşıldı',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create repost error:', error);
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

      // Check if repost exists
      const existingRepost = await Repost.findByUserAndPost(userId, postId);
      if (!existingRepost) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Paylaşım bulunamadı'
          },
          timestamp: new Date().toISOString()
        });
      }

      await Repost.deleteByUserAndPost(userId, postId);

      res.status(204).send();
    } catch (error) {
      console.error('Delete repost error:', error);
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

      const reposts = await Repost.findByPostId(postId, limit, offset);
      const total = await Repost.countByPostId(postId);

      res.json({
        success: true,
        data: { reposts },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get reposts error:', error);
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

  async checkUserRepost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const repost = await Repost.findByUserAndPost(userId, postId);

      res.json({
        success: true,
        data: { reposted: !!repost },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Check repost error:', error);
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

module.exports = repostController;
