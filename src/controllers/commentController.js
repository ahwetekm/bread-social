const Comment = require('../models/Comment');

const commentController = {
  async create(req, res) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Yorum icerigi bos olamaz',
            details: [{ field: 'content', message: 'Yorum icerigi bos olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Yorum icerigi 500 karakterden uzun olamaz',
            details: [{ field: 'content', message: 'Yorum icerigi 500 karakterden uzun olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      const comment = await Comment.create({ userId, postId, content: content.trim() });

      res.status(201).json({
        success: true,
        data: { comment },
        message: 'Yorum basariyla olusturuldu',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create comment error:', error);
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

  async getByPostId(req, res) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const comments = await Comment.findByPostId(postId, limit, offset);
      const total = await Comment.countByPostId(postId);

      res.json({
        success: true,
        data: { comments },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get comments error:', error);
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
            message: 'Yorum icerigi bos olamaz',
            details: [{ field: 'content', message: 'Yorum icerigi bos olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Yorum icerigi 500 karakterden uzun olamaz',
            details: [{ field: 'content', message: 'Yorum icerigi 500 karakterden uzun olamaz' }]
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if comment exists and belongs to user
      const existingComment = await Comment.findById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Yorum bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (existingComment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bu yorumu duzenleme yetkiniz yok'
          },
          timestamp: new Date().toISOString()
        });
      }

      const comment = await Comment.update(id, { content: content.trim() });

      res.json({
        success: true,
        data: { comment },
        message: 'Yorum basariyla guncellendi',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update comment error:', error);
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

      // Check if comment exists and belongs to user
      const existingComment = await Comment.findById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Yorum bulunamadi'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (existingComment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bu yorumu silme yetkiniz yok'
          },
          timestamp: new Date().toISOString()
        });
      }

      await Comment.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Delete comment error:', error);
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

module.exports = commentController;
