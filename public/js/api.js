// API Cache
const apiCache = {
  likes: {},
  reposts: {},
  
  get(key) {
    const item = this[key];
    if (!item) return null;
    
    // Check if cache is expired (5 minutes)
    if (Date.now() - item.timestamp > 5 * 60 * 1000) {
      delete this[key];
      return null;
    }
    return item.data;
  },
  
  set(key, data) {
    this[key] = { data, timestamp: Date.now() };
  },
  
  invalidate(key) {
    delete this[key];
  },
  
  invalidatePattern(prefix) {
    Object.keys(this).forEach(k => {
      if (k.startsWith(prefix)) {
        delete this[k];
      }
    });
  }
};

// API Base URL
const API_BASE = '/api/v1';

// API Helper Functions
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Bir hata oluştu');
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {};
  },

  // Auth API
  auth: {
    async register(data) {
      return api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async login(data) {
      return api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async logout() {
      return api.request('/auth/logout', {
        method: 'POST'
      });
    },

    async me() {
      return api.request('/auth/me');
    }
  },

  // Posts API
  posts: {
    async getAll(page = 1, limit = 20) {
      return api.request(`/posts?page=${page}&limit=${limit}`);
    },

    async getById(id) {
      return api.request(`/posts/${id}`);
    },

    async create(content) {
      return api.request('/posts', {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    },

    async update(id, content) {
      return api.request(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
    },

    async delete(id) {
      return api.request(`/posts/${id}`, {
        method: 'DELETE'
      });
    },

    async getByUserId(userId, page = 1, limit = 20) {
      return api.request(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    }
  },

  // Users API
  users: {
    async getProfile(username) {
      return api.request(`/users/${username}`);
    },

    async getProfileById(userId) {
      return api.request(`/users/id/${userId}`);
    },

    async updateProfile(data) {
      return api.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getUserPosts(userId, page = 1, limit = 20) {
      return api.request(`/users/${userId}/posts?page=${page}&limit=${limit}`);
    }
  },

  // Likes API
  likes: {
    async create(postId) {
      // Invalidate cache
      apiCache.invalidate(`like:${postId}`);
      const response = await api.request(`/likes/posts/${postId}`, {
        method: 'POST'
      });
      // Update cache with liked state
      apiCache.set(`like:${postId}`, { liked: true });
      return response;
    },

    async delete(postId) {
      // Invalidate cache
      apiCache.invalidate(`like:${postId}`);
      const response = await api.request(`/likes/posts/${postId}`, {
        method: 'DELETE'
      });
      // Update cache with unliked state
      apiCache.set(`like:${postId}`, { liked: false });
      return response;
    },

    async getByPostId(postId, page = 1, limit = 20) {
      return api.request(`/likes/posts/${postId}?page=${page}&limit=${limit}`);
    },

    async checkUserLike(postId) {
      // Check cache first
      const cached = apiCache.get(`like:${postId}`);
      if (cached !== null) {
        return { success: true, data: cached };
      }
      
      const response = await api.request(`/likes/posts/${postId}/check`);
      
      // Cache the result
      if (response.success) {
        apiCache.set(`like:${postId}`, { liked: response.data.liked });
      }
      
      return response;
    }
  },

  // Comments API
  comments: {
    async create(postId, content) {
      return api.request(`/comments/posts/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    },

    async getByPostId(postId, page = 1, limit = 20) {
      return api.request(`/comments/posts/${postId}?page=${page}&limit=${limit}`);
    },

    async update(commentId, content) {
      return api.request(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
    },

    async delete(commentId) {
      return api.request(`/comments/${commentId}`, {
        method: 'DELETE'
      });
    }
  },

  // Reposts API
  reposts: {
    async create(postId) {
      // Invalidate cache
      apiCache.invalidate(`repost:${postId}`);
      const response = await api.request(`/reposts/posts/${postId}`, {
        method: 'POST'
      });
      // Update cache with reposted state
      apiCache.set(`repost:${postId}`, { reposted: true });
      return response;
    },

    async delete(postId) {
      // Invalidate cache
      apiCache.invalidate(`repost:${postId}`);
      const response = await api.request(`/reposts/posts/${postId}`, {
        method: 'DELETE'
      });
      // Update cache with unreposted state
      apiCache.set(`repost:${postId}`, { reposted: false });
      return response;
    },

    async getByPostId(postId, page = 1, limit = 20) {
      return api.request(`/reposts/posts/${postId}?page=${page}&limit=${limit}`);
    },

    async checkUserRepost(postId) {
      // Check cache first
      const cached = apiCache.get(`repost:${postId}`);
      if (cached !== null) {
        return { success: true, data: cached };
      }
      
      const response = await api.request(`/reposts/posts/${postId}/check`);
      
      // Cache the result
      if (response.success) {
        apiCache.set(`repost:${postId}`, { reposted: response.data.reposted });
      }
      
      return response;
    }
  },

  // Follows API
  follows: {
    async follow(userId) {
      return api.request(`/follows/${userId}`, {
        method: 'POST'
      });
    },

    async unfollow(userId) {
      return api.request(`/follows/${userId}`, {
        method: 'DELETE'
      });
    },

    async getFollowers(userId, page = 1, limit = 20) {
      return api.request(`/follows/${userId}/followers?page=${page}&limit=${limit}`);
    },

    async getFollowing(userId, page = 1, limit = 20) {
      return api.request(`/follows/${userId}/following?page=${page}&limit=${limit}`);
    },

    async checkFollow(userId) {
      return api.request(`/follows/${userId}/check`);
    }
  },

  // Feed API
  feed: {
    async getFeed(page = 1, limit = 20) {
      return api.request(`/feed?page=${page}&limit=${limit}`);
    }
  },

  // Search API
  search: {
    async searchUsers(query, page = 1, limit = 20) {
      return api.request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    },

    async searchPosts(query, page = 1, limit = 20) {
      return api.request(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }
  }
};

// Utility function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'şimdi';
  if (minutes < 60) return `${minutes}d`;
  if (hours < 24) return `${hours}sa`;
  if (days < 7) return `${days}g`;
  
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// Utility function to create post HTML
function createPostHTML(post) {
  const timeAgo = formatDate(post.created_at);
  const displayName = post.display_name || post.username;
  const likeCount = post.like_count || 0;
  const commentCount = post.comment_count || 0;
  const repostCount = post.repost_count || 0;

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser.id === post.user_id;

  return `
    <article class="post" data-post-id="${post.id}" data-user-id="${post.user_id}">
      <div class="post-header">
        <div class="post-avatar">${post.avatar_emoji || '🧑'}</div>
        <div class="post-author">
          <div class="post-name">${displayName}</div>
          <div class="post-handle">@${post.username} · ${timeAgo}</div>
        </div>
        ${isOwner ? `
          <div class="post-menu">
            <button class="post-menu-btn" aria-label="Post menüsü">•••</button>
            <div class="post-menu-dropdown">
              <button class="post-menu-item edit-post-btn" data-post-id="${post.id}">✏️ Düzenle</button>
              <button class="post-menu-item delete-post-btn" data-post-id="${post.id}">🗑️ Sil</button>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="post-content">
        ${post.content}
      </div>
      <div class="post-actions">
        <button class="action-btn comment-btn" data-post-id="${post.id}"><span class="icon icon-comment">💬</span> ${commentCount}</button>
        <button class="action-btn repost-btn" data-post-id="${post.id}"><span class="icon icon-repost">🔄</span> ${repostCount}</button>
        <button class="action-btn like-btn" data-post-id="${post.id}"><span class="icon icon-like">🤍</span> ${likeCount}</button>
        <button class="action-btn"><span class="icon icon-share">📤</span></button>
      </div>
    </article>
  `;
}
