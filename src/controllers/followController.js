const Follow = require('../models/Follow');

const followController = {
  async follow(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      const followingId = parseInt(userId);

      // Check if trying to follow self
      if (followerId === followingId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Kendinizi takip edemezsiniz'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if already following
      const existingFollow = await Follow.findByFollowerAndFollowing(followerId, followingId);
      if (existingFollow) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_FOLLOWING',
            message: 'Bu kullanıcıyı zaten takip ediyorsunuz'
          },
          timestamp: new Date().toISOString()
        });
      }

      const follow = await Follow.create({ followerId, followingId });

      res.status(201).json({
        success: true,
        data: { follow },
        message: 'Kullanıcı takip edildi',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Follow error:', error);
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

  async unfollow(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      const followingId = parseInt(userId);

      // Check if follow exists
      const existingFollow = await Follow.findByFollowerAndFollowing(followerId, followingId);
      if (!existingFollow) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Takip ilişkisi bulunamadı'
          },
          timestamp: new Date().toISOString()
        });
      }

      await Follow.delete(followerId, followingId);

      res.status(204).send();
    } catch (error) {
      console.error('Unfollow error:', error);
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

  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const followers = await Follow.getFollowers(userId, limit, offset);
      const total = await Follow.countFollowers(userId);

      res.json({
        success: true,
        data: { followers },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get followers error:', error);
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

  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const following = await Follow.getFollowing(userId, limit, offset);
      const total = await Follow.countFollowing(userId);

      res.json({
        success: true,
        data: { following },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get following error:', error);
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

  async checkFollow(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      const followingId = parseInt(userId);

      const isFollowing = await Follow.isFollowing(followerId, followingId);

      res.json({
        success: true,
        data: { following: isFollowing },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Check follow error:', error);
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

module.exports = followController;
