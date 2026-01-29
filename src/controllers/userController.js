const User = require('../models/User');
const Post = require('../models/Post');

const userController = {
  async getProfile(req, res) {
    try {
      const { username } = req.params;

      const user = await User.findByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Kullanici bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      const stats = await User.getProfileStats(user.id);

      res.json({
        success: true,
        data: {
          user: User.sanitize(user),
          stats
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async getProfileById(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Kullanici bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      const stats = await User.getProfileStats(user.id);

      res.json({
        success: true,
        data: {
          user: User.sanitize(user),
          stats
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get profile by id error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { display_name, bio, avatar_emoji } = req.body;

      const user = await User.update(userId, { display_name, bio, avatar_emoji });

      res.json({
        success: true,
        data: {
          user: User.sanitize(user)
        },
        message: 'Profil basariyla guncellendi',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async getUserPosts(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const posts = await Post.findByUserId(userId, limit, offset);
      const total = await Post.countByUserId(userId);

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
      console.error('Get user posts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Validate query parameter
      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Arama sorgusu bos olamaz'
          },
          timestamp: new Date().toISOString()
        });
      }

      const users = await User.searchUsers(q.trim(), limit, offset);
      const total = await User.countSearchUsers(q.trim());

      res.json({
        success: true,
        data: { users },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata olustu. Lutfen tekrar deneyin.'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = userController;
