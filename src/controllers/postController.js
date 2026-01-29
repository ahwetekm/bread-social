const Post = require('../models/Post');

const postController = {
  async create(req, res) {
    try {
      const { content } = req.body;
      const userId = req.user.id;

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Post icerigi bos olamaz',
            details: [{ field: 'content', message: 'Post icerigi bos olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Post icerigi 500 karakterden uzun olamaz',
            details: [{ field: 'content', message: 'Post icerigi 500 karakterden uzun olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      const post = await Post.create({ userId, content: content.trim() });

      res.status(201).json({
        success: true,
        data: { post },
        message: 'Post basariyla olusturuldu',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create post error:', error);
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

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const posts = await Post.findAll(limit, offset);
      const total = await Post.countAll();

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
      console.error('Get posts error:', error);
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Post bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: { post },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get post error:', error);
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Post icerigi bos olamaz',
            details: [{ field: 'content', message: 'Post icerigi bos olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Post icerigi 500 karakterden uzun olamaz',
            details: [{ field: 'content', message: 'Post icerigi 500 karakterden uzun olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if post exists and belongs to user
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Post bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (existingPost.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bu postu duzenleme yetkiniz yok'
          },
          timestamp: new Date().toISOString()
        });
      }

      const post = await Post.update(id, { content: content.trim() });

      res.json({
        success: true,
        data: { post },
        message: 'Post basariyla guncellendi',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update post error:', error);
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

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if post exists and belongs to user
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Post bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (existingPost.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bu postu silme yetkiniz yok'
          },
          timestamp: new Date().toISOString()
        });
      }

      await Post.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Delete post error:', error);
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

  async getByUserId(req, res) {
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

  async searchPosts(req, res) {
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

      const posts = await Post.searchPosts(q.trim(), limit, offset);
      const total = await Post.countSearchPosts(q.trim());

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
      console.error('Search posts error:', error);
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

module.exports = postController;
