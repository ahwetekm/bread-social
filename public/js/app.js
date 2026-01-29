// Update Like Status for Posts
async function updateLikeStatusForPosts() {
  // Kullanıcı giriş yapmamışsa, like durumunu kontrol etme
  if (!Auth.isAuthenticated) {
    return;
  }

  const posts = document.querySelectorAll('.post');

  for (const postElement of posts) {
    const postId = postElement.getAttribute('data-post-id');
    if (!postId) continue;

    try {
      const response = await api.likes.checkUserLike(postId);

      if (response.success && response.data.liked) {
        const likeBtn = postElement.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('.icon-like');
        if (likeIcon) {
          likeIcon.textContent = '❤️';
          likeBtn.classList.add('liked');
        }
      } else {
        const likeBtn = postElement.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('.icon-like');
        if (likeIcon) {
          likeIcon.textContent = '🤍';
          likeBtn.classList.remove('liked');
        }
      }
    } catch (error) {
      console.error('Like durumu kontrol hatası:', error);
    }
  }
}

// Load Posts Function
async function loadPosts(page = 1, limit = 20, append = false) {
  const postsContainer = document.querySelector('.posts');

  if (!postsContainer) return;

  // Show loading state
  if (!append) {
    postsContainer.innerHTML = '<div class="loading">Yükleniyor...</div>';
  }

  try {
    const response = await api.posts.getAll(page, limit);

    if (response.success) {
      // Remove loading state
      const loadingElement = postsContainer.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }

      // Clear container if not appending
      if (!append) {
        postsContainer.innerHTML = '';
      }

      // Add posts
      response.data.posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.setAttribute('data-post-id', post.id);
        postElement.innerHTML = createPostHTML(post);
        postsContainer.appendChild(postElement);
      });

      // Update like status for posts
      await updateLikeStatusForPosts();

      // Update pagination info if pagination exists
      if (response.data.pagination) {
        console.log('Yüklenen sayfa:', page, 'Toplam sayfa:', response.data.pagination.totalPages, 'Toplam post:', response.data.pagination.total);
        updatePagination(response.data.pagination);
        console.log('Yüklenen sayfa:', response.data.pagination.page, 'Toplam sayfa:', response.data.pagination.totalPages, 'Toplam post:', response.data.pagination.total);
      }
    }
  } catch (error) {
    console.error('Post yükleme hatası:', error);
    postsContainer.innerHTML = '<div class="error">Postlar yüklenirken bir hata oluştu</div>';
  }
}

// Load Feed Function (for authenticated users)
async function loadFeed(page = 1, limit = 20, append = false) {
  const postsContainer = document.querySelector('.posts');

  if (!postsContainer) return;

  // Show loading state
  if (!append) {
    postsContainer.innerHTML = '<div class="loading">Yükleniyor...</div>';
  }

  try {
    const response = await api.feed.getFeed(page, limit);

    if (response.success) {
      // Remove loading state
      const loadingElement = postsContainer.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }

      // Clear container if not appending
      if (!append) {
        postsContainer.innerHTML = '';
      }

      // Add posts
      response.data.posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.setAttribute('data-post-id', post.id);
        postElement.innerHTML = createPostHTML(post);
        postsContainer.appendChild(postElement);
      });

      // Update like status for posts
      await updateLikeStatusForPosts();

      // Update pagination info if pagination exists
      if (response.data.pagination) {
        console.log('Yüklenen sayfa:', page, 'Toplam sayfa:', response.data.pagination.totalPages, 'Toplam post:', response.data.pagination.total);
        updatePagination(response.data.pagination);
        console.log('Yüklenen sayfa:', response.data.pagination.page, 'Toplam sayfa:', response.data.pagination.totalPages, 'Toplam post:', response.data.pagination.total);
      }
    }
  } catch (error) {
    console.error('Feed yükleme hatası:', error);
    postsContainer.innerHTML = '<div class="error">Feed yüklenirken bir hata oluştu</div>';
  }
}

// Update Pagination UI
function updatePagination(pagination) {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  
  if (loadMoreBtn && pagination) {
    if (pagination.page >= pagination.totalPages) {
      loadMoreBtn.style.display = 'none';
      hasMorePosts = false;
    } else {
      loadMoreBtn.style.display = 'block';
      hasMorePosts = true;
    }
  }
}

// Section Navigation
document.addEventListener('DOMContentLoaded', function() {
  // Load posts or feed on page load based on auth status
  if (Auth.isAuthenticated) {
    loadFeed();
  } else {
    loadPosts();
  }
  
  // Pagination - Load More Button
  let currentPage = 1;
  let isLoading = false;
  let hasMorePosts = true;
  
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async function() {
      if (isLoading) return;
      
      isLoading = true;
      loadMoreBtn.textContent = 'Yükleniyor...';
      loadMoreBtn.disabled = true;
      
      try {
        currentPage++;
        await loadPosts(currentPage, 20, true);
      } catch (error) {
        console.error('Daha fazla yükleme hatası:', error);
        currentPage--; // Revert page number on error
      } finally {
        isLoading = false;
        loadMoreBtn.textContent = 'Daha Fazla Yükle';
        loadMoreBtn.disabled = false;
      }
    });
  }
  
  // Intersection Observer for Lazy Loading
  const sentinel = document.getElementById('posts-sentinel');
  let intersectionObserver = null;
  
  function setupIntersectionObserver() {
    if (!sentinel) return;
    
    // Disconnect existing observer
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    
    intersectionObserver = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      
      if (entry.isIntersecting && !isLoading && hasMorePosts) {
        console.log('Sentinel görünür, postlar yükleniyor...');
        
        isLoading = true;
        currentPage++;
        
        try {
          if (Auth.isAuthenticated) {
            await loadFeed(currentPage, 20, true);
          } else {
            await loadPosts(currentPage, 20, true);
          }
        } catch (error) {
          console.error('Intersection Observer post yükleme hatası:', error);
          currentPage--;
          hasMorePosts = false;
        } finally {
          isLoading = false;
        }
      }
    }, {
      root: null,
      rootMargin: '200px', // 200px önceden yüklemeye başla (daha erken)
      threshold: 0.05 // Daha hassas (5% görünür olduğunda)
    });
    
    intersectionObserver.observe(sentinel);
  }
  
  // Setup intersection observer after initial load
  // DOMContentLoaded'dan sonra sentinel elementinin var olduğundan emin ol
  if (sentinel) {
    setupIntersectionObserver();
  } else {
    // Sentinel yoksa, sayfa yüklenirken ekle
    const postsContainer = document.querySelector('.posts');
    if (postsContainer) {
      const sentinelElement = document.createElement('div');
      sentinelElement.id = 'posts-sentinel';
      sentinelElement.className = 'posts-sentinel';
      sentinelElement.innerHTML = '<div class="loading">Yükleniyor...</div>';
      postsContainer.appendChild(sentinelElement);
      setupIntersectionObserver();
    }
  }
  // DOMContentLoaded'dan sonra sentinel elementinin var olduğundan emin ol
  if (sentinel) {
    setupIntersectionObserver();
  } else {
    // Sentinel yoksa, sayfa yüklenirken ekle
    const postsContainer = document.querySelector('.posts');
    if (postsContainer) {
      const sentinelElement = document.createElement('div');
      sentinelElement.id = 'posts-sentinel';
      sentinelElement.className = 'posts-sentinel';
      sentinelElement.innerHTML = '<div class="loading">Yükleniyor...</div>';
      postsContainer.appendChild(sentinelElement);
      setupIntersectionObserver();
    }
  }
  
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      const targetSection = this.getAttribute('data-section');

      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));

      // Add active class to clicked nav item
      this.classList.add('active');

      // Hide all sections
      sections.forEach(section => section.classList.remove('active'));

      // Show target section
      const targetElement = document.getElementById(targetSection + '-section');
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });

  // Notifications Modal
  const notificationsModal = document.getElementById('notifications-modal');
  const notificationsBtns = document.querySelectorAll('.nav-btn');
  const modalClose = document.querySelector('.modal-close');
  const modalOverlay = document.querySelector('.modal-overlay');

  // Open modal when clicking notifications button
  notificationsBtns.forEach(btn => {
    if (btn.textContent.includes('Bildirimler')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        notificationsModal.classList.add('active');
      });
    }
  });

  // Close modal when clicking X button
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      notificationsModal.classList.remove('active');
    });
  }

  // Close modal when clicking overlay
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function() {
      notificationsModal.classList.remove('active');
    });
  }

  // Close modal with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && notificationsModal.classList.contains('active')) {
      notificationsModal.classList.remove('active');
    }
  });

  // Mark all as read button
  const markAllReadBtn = document.querySelector('.modal-btn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', function() {
      const unreadItems = document.querySelectorAll('.notification-item.unread');
      unreadItems.forEach(item => {
        item.classList.remove('unread');
      });
    });
  }

  // Profile Tabs
  const profileTabs = document.querySelectorAll('.profile-tab');
  const profileTabContents = document.querySelectorAll('.profile-tab-content');

  profileTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all tabs
      profileTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      this.classList.add('active');

      // Hide all tab contents
      profileTabContents.forEach(content => content.classList.remove('active'));

      // Show target tab content
      const targetContent = document.getElementById(targetTab + '-tab');
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Messages - Conversation Selection
  const conversationItems = document.querySelectorAll('.conversation-item');

  conversationItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all conversations
      conversationItems.forEach(conv => conv.classList.remove('active'));

      // Add active class to clicked conversation
      this.classList.add('active');

      // Remove unread badge if exists
      const badge = this.querySelector('.conversation-badge');
      if (badge) {
        badge.remove();
      }
    });
  });

  // Messages - Send Message
  const chatInput = document.querySelector('.chat-input');
  const chatSendBtn = document.querySelector('.chat-send-btn');
  const chatMessages = document.querySelector('.chat-messages');

  function sendMessage() {
    const messageText = chatInput.value.trim();

    if (messageText === '') return;

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    messageBubble.textContent = messageText;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    const now = new Date();
    messageTime.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    messageContent.appendChild(messageBubble);
    messageContent.appendChild(messageTime);
    messageDiv.appendChild(messageContent);

    // Add to chat
    chatMessages.appendChild(messageDiv);

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Ana Sayfa Post Oluşturma Alanı
  const postCreateInput = document.querySelector('.post-create-input');
  const postCreateBtn = document.querySelector('.post-create-btn');
  let isFromHomePage = false; // Postun ana sayfadan mı yoksa modaldan mı geldiğini takip et

  // Ana sayfa post-create input için karakter sayacı ve buton kontrolü
  if (postCreateInput) {
    postCreateInput.addEventListener('input', function() {
      const length = this.value.length;

      // Enable/disable submit button
      if (length > 0 && length <= 500) {
        postCreateBtn.disabled = false;
      } else {
        postCreateBtn.disabled = true;
      }
    });
  }

  // Ana sayfa PAYLAŞ butonu - onay modalını aç
  if (postCreateBtn) {
    postCreateBtn.addEventListener('click', function() {
      const postText = postCreateInput.value.trim();

      if (postText === '') return;

      isFromHomePage = true;
      openPostConfirmModal(postText);
    });
  }

  // New Post Modal
  const newPostModal = document.getElementById('new-post-modal');
  const newPostBtn = document.querySelector('.post-btn');
  const newPostClose = document.querySelector('.new-post-close');
  const newPostTextarea = document.querySelector('.new-post-textarea');
  const charCount = document.querySelector('.char-count');
  const postSubmitBtn = document.querySelector('.post-submit-btn');
  const modalBtnCancel = document.querySelector('.modal-btn-cancel');
  const newPostOverlay = document.querySelectorAll('.modal-overlay')[1];

  // Open new post modal
  if (newPostBtn) {
    newPostBtn.addEventListener('click', function() {
      newPostModal.classList.add('active');
      newPostTextarea.focus();
    });
  }

  // Close new post modal
  function closeNewPostModal() {
    newPostModal.classList.remove('active');
    newPostTextarea.value = '';
    charCount.textContent = '0';
    postSubmitBtn.disabled = true;
    charCount.classList.remove('warning', 'danger');
  }

  if (newPostClose) {
    newPostClose.addEventListener('click', closeNewPostModal);
  }

  if (modalBtnCancel) {
    modalBtnCancel.addEventListener('click', closeNewPostModal);
  }

  if (newPostOverlay) {
    newPostOverlay.addEventListener('click', closeNewPostModal);
  }

  // Character counter and validation
  if (newPostTextarea) {
    newPostTextarea.addEventListener('input', function() {
      const length = this.value.length;
      charCount.textContent = length;

      // Enable/disable submit button
      if (length > 0 && length <= 500) {
        postSubmitBtn.disabled = false;
      } else {
        postSubmitBtn.disabled = true;
      }

      // Color warning
      charCount.classList.remove('warning', 'danger');
      if (length > 400 && length <= 450) {
        charCount.classList.add('warning');
      } else if (length > 450) {
        charCount.classList.add('danger');
      }
    });
  }

  // Submit new post
  if (postSubmitBtn) {
    postSubmitBtn.addEventListener('click', async function() {
      const postText = newPostTextarea.value.trim();

      if (postText === '') return;

      // Open confirmation modal
      openPostConfirmModal(postText);
    });
  }

  // Post confirmation modal
  const postConfirmModal = document.getElementById('post-confirm-modal');
  const postConfirmClose = document.querySelector('.post-confirm-close');
  const postConfirmCancel = document.querySelector('.post-confirm-cancel');
  const postConfirmConfirm = document.querySelector('.post-confirm-confirm');
  const postConfirmPreview = document.getElementById('post-confirm-preview');
  let pendingPostText = '';

  function openPostConfirmModal(postText) {
    pendingPostText = postText;
    postConfirmPreview.textContent = postText;
    postConfirmModal.classList.add('active');
  }

  function closePostConfirmModal() {
    postConfirmModal.classList.remove('active');
    pendingPostText = '';
    postConfirmPreview.textContent = '';
    isFromHomePage = false;
  }

  if (postConfirmClose) {
    postConfirmClose.addEventListener('click', closePostConfirmModal);
  }

  if (postConfirmCancel) {
    postConfirmCancel.addEventListener('click', closePostConfirmModal);
  }

  if (postConfirmConfirm) {
    postConfirmConfirm.addEventListener('click', async function() {
      if (pendingPostText === '') return;

      try {
        // Create post via API
        const response = await api.posts.create(pendingPostText);

        if (response.success) {
          const postsContainer = document.querySelector('.posts');
          const newPost = document.createElement('article');
          newPost.className = 'post';
          newPost.innerHTML = createPostHTML(response.data.post);

          // Add to top of feed
          if (postsContainer) {
            postsContainer.insertBefore(newPost, postsContainer.firstChild);
          }

          // Eğer ana sayfadan geldiyse, ana sayfa alanını temizle
          if (isFromHomePage && postCreateInput) {
            postCreateInput.value = '';
            postCreateBtn.disabled = true;
            isFromHomePage = false;
          } else {
            // Modal'dan geldiyse, modalı kapat
            closeNewPostModal();
          }

          // Close confirmation modal
          closePostConfirmModal();

          // Scroll to new post
          newPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.error('Post oluşturma hatası:', error);
        alert('Post oluşturulurken bir hata oluştu: ' + error.message);
      }
    });
  }

  // Close with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (newPostModal.classList.contains('active')) {
        closeNewPostModal();
      }
      if (editPostModal.classList.contains('active')) {
        closeEditPostModal();
      }
      if (deletePostModal.classList.contains('active')) {
        closeDeletePostModal();
      }
    }
  });

  // Edit Post Modal
  const editPostModal = document.getElementById('edit-post-modal');
  const editPostClose = document.querySelector('.edit-post-close');
  const editPostCancel = document.querySelector('.edit-post-cancel');
  const editPostSave = document.querySelector('.edit-post-save');
  const editPostTextarea = document.querySelector('.edit-post-textarea');
  const editCharCount = document.querySelector('.edit-char-count');
  let currentEditingPostId = null;

  function openEditPostModal(postId, currentContent) {
    currentEditingPostId = postId;
    editPostTextarea.value = currentContent;
    editCharCount.textContent = currentContent.length;
    editPostSave.disabled = currentContent.length === 0 || currentContent.length > 500;
    editPostModal.classList.add('active');
    editPostTextarea.focus();
  }

  function closeEditPostModal() {
    editPostModal.classList.remove('active');
    editPostTextarea.value = '';
    editCharCount.textContent = '0';
    currentEditingPostId = null;
  }

  if (editPostClose) {
    editPostClose.addEventListener('click', closeEditPostModal);
  }

  if (editPostCancel) {
    editPostCancel.addEventListener('click', closeEditPostModal);
  }

  if (editPostTextarea) {
    editPostTextarea.addEventListener('input', function() {
      const length = this.value.length;
      editCharCount.textContent = length;

      if (length > 0 && length <= 500) {
        editPostSave.disabled = false;
      } else {
        editPostSave.disabled = true;
      }

      editCharCount.classList.remove('warning', 'danger');
      if (length > 400 && length <= 450) {
        editCharCount.classList.add('warning');
      } else if (length > 450) {
        editCharCount.classList.add('danger');
      }
    });
  }

  if (editPostSave) {
    editPostSave.addEventListener('click', async function() {
      const postText = editPostTextarea.value.trim();

      if (postText === '' || !currentEditingPostId) return;

      try {
        const response = await api.posts.update(currentEditingPostId, postText);

        if (response.success) {
          const postElement = document.querySelector(`[data-post-id="${currentEditingPostId}"]`);
          if (postElement) {
            const postContent = postElement.querySelector('.post-content');
            if (postContent) {
              postContent.textContent = postText;
            }
          }

          closeEditPostModal();
        }
      } catch (error) {
        console.error('Post güncelleme hatası:', error);
        alert('Post güncellenirken bir hata oluştu: ' + error.message);
      }
    });
  }

  // Delete Post Modal
  const deletePostModal = document.getElementById('delete-post-modal');
  const deletePostClose = document.querySelector('.delete-post-close');
  const deletePostCancel = document.querySelector('.delete-post-cancel');
  const deletePostConfirm = document.querySelector('.delete-post-confirm');
  let currentDeletingPostId = null;

  function openDeletePostModal(postId) {
    currentDeletingPostId = postId;
    deletePostModal.classList.add('active');
  }

  function closeDeletePostModal() {
    deletePostModal.classList.remove('active');
    currentDeletingPostId = null;
  }

  if (deletePostClose) {
    deletePostClose.addEventListener('click', closeDeletePostModal);
  }

  if (deletePostCancel) {
    deletePostCancel.addEventListener('click', closeDeletePostModal);
  }

  if (deletePostConfirm) {
    deletePostConfirm.addEventListener('click', async function() {
      if (!currentDeletingPostId) return;

      try {
        await api.posts.delete(currentDeletingPostId);

        const postElement = document.querySelector(`[data-post-id="${currentDeletingPostId}"]`);
        if (postElement) {
          postElement.remove();
        }

        closeDeletePostModal();
      } catch (error) {
        console.error('Post silme hatası:', error);
        alert('Post silinirken bir hata oluştu: ' + error.message);
      }
    });
  }

  // Comment Modal
  const commentModal = document.getElementById('comment-modal');
  const commentClose = document.querySelector('.comment-close');
  const commentInput = document.getElementById('comment-input');
  const commentSubmitBtn = document.getElementById('comment-submit-btn');
  const commentCharCount = document.querySelector('.comment-char-count');
  const commentsList = document.getElementById('comments-list');
  let currentCommentPostId = null;

  function openCommentModal(postId) {
    currentCommentPostId = postId;
    commentModal.classList.add('active');
    commentInput.focus();
    loadComments(postId);
  }

  function closeCommentModal() {
    commentModal.classList.remove('active');
    commentInput.value = '';
    commentCharCount.textContent = '0';
    commentSubmitBtn.disabled = true;
    currentCommentPostId = null;
    commentsList.innerHTML = '';
  }

  async function loadComments(postId) {
    try {
      const response = await api.comments.getByPostId(postId);
      
      if (response.success) {
        commentsList.innerHTML = '';
        
        if (response.data.comments.length === 0) {
          commentsList.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">💬</div>
              <div class="empty-title">Henüz yorum yok</div>
              <div class="empty-description">İlk yorumu sen yap!</div>
            </div>
          `;
        } else {
          response.data.comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = createCommentHTML(comment);
            commentsList.appendChild(commentElement);
          });
        }
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      commentsList.innerHTML = `
        <div class="error">Yorumlar yüklenirken bir hata oluştu</div>
      `;
    }
  }

  function createCommentHTML(comment) {
    const timeAgo = formatDate(comment.created_at);
    const displayName = comment.display_name || comment.username;
    
    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-avatar">${comment.avatar_emoji || '🧑'}</div>
        <div class="comment-content-wrapper">
          <div class="comment-header">
            <span class="comment-author">${displayName}</span>
            <span class="comment-time">@${comment.username} · ${timeAgo}</span>
          </div>
          <div class="comment-text">${comment.content}</div>
        </div>
      </div>
    `;
  }

  if (commentClose) {
    commentClose.addEventListener('click', closeCommentModal);
  }

  if (commentInput) {
    commentInput.addEventListener('input', function() {
      const length = this.value.length;
      commentCharCount.textContent = length;

      if (length > 0 && length <= 500) {
        commentSubmitBtn.disabled = false;
      } else {
        commentSubmitBtn.disabled = true;
      }

      commentCharCount.classList.remove('warning', 'danger');
      if (length > 400 && length <= 450) {
        commentCharCount.classList.add('warning');
      } else if (length > 450) {
        commentCharCount.classList.add('danger');
      }
    });
  }

  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener('click', async function() {
      const commentText = commentInput.value.trim();

      if (commentText === '' || !currentCommentPostId) return;

      try {
        const response = await api.comments.create(currentCommentPostId, commentText);

        if (response.success) {
          const newComment = document.createElement('div');
          newComment.className = 'comment-item';
          newComment.innerHTML = createCommentHTML(response.data.comment);
          
          // Remove empty state if exists
          const emptyState = commentsList.querySelector('.empty-state');
          if (emptyState) {
            emptyState.remove();
          }
          
          commentsList.appendChild(newComment);
          commentInput.value = '';
          commentCharCount.textContent = '0';
          commentSubmitBtn.disabled = true;

          // Update comment count on post
          const postElement = document.querySelector(`[data-post-id="${currentCommentPostId}"]`);
          if (postElement) {
            const commentBtn = postElement.querySelector('.comment-btn');
            if (commentBtn) {
              const currentCount = parseInt(commentBtn.textContent.trim()) || 0;
              commentBtn.innerHTML = `<span class="icon icon-comment">💬</span> ${currentCount + 1}`;
            }
          }
        }
      } catch (error) {
        console.error('Yorum gönderme hatası:', error);
        alert('Yorum gönderilirken bir hata oluştu: ' + error.message);
      }
    });
  }

  // Event delegation for post actions
  document.addEventListener('click', async function(e) {
    const editBtn = e.target.closest('.edit-post-btn');
    const deleteBtn = e.target.closest('.delete-post-btn');
    const likeBtn = e.target.closest('.like-btn');
    const repostBtn = e.target.closest('.repost-btn');
    const commentBtn = e.target.closest('.comment-btn');

    if (editBtn) {
      const postElement = editBtn.closest('.post');
      const postId = postElement.getAttribute('data-post-id');
      const postContent = postElement.querySelector('.post-content');
      openEditPostModal(postId, postContent.textContent);
    }

    if (deleteBtn) {
      const postElement = deleteBtn.closest('.post');
      const postId = postElement.getAttribute('data-post-id');
      openDeletePostModal(postId);
    }

    if (likeBtn) {
      e.preventDefault();
      const postElement = likeBtn.closest('.post');
      const postId = postElement.getAttribute('data-post-id');
      const likeIcon = likeBtn.querySelector('.icon-like');
      const likeCountSpan = likeBtn;

      try {
        // Check if already liked
        const checkResponse = await api.likes.checkUserLike(postId);

        let isLiked = checkResponse.success && checkResponse.data.liked;

        if (isLiked) {
          // Unlike
          await api.likes.delete(postId);
          likeIcon.textContent = '🤍';
          likeBtn.classList.remove('liked');
          isLiked = false;
        } else {
          // Like
          await api.likes.create(postId);
          likeIcon.textContent = '❤️';
          likeBtn.classList.add('liked');
          isLiked = true;
        }

        // Update like count - extract only the number from the text
        const currentText = likeCountSpan.textContent.trim();
        const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0') || 0;
        likeCountSpan.innerHTML = `<span class="icon icon-like">${likeIcon.textContent}</span> ${isLiked ? currentCount + 1 : currentCount - 1}`;
      } catch (error) {
        console.error('Like hatası:', error);
        alert('Like işlemi sırasında bir hata oluştu: ' + error.message);
      }
    }

    if (repostBtn) {
      e.preventDefault();
      const postElement = repostBtn.closest('.post');
      const postId = postElement.getAttribute('data-post-id');
      const repostIcon = repostBtn.querySelector('.icon-repost');
      const repostCountSpan = repostBtn;

      try {
        // Check if already reposted
        const checkResponse = await api.reposts.checkUserRepost(postId);

        let isReposted = checkResponse.success && checkResponse.data.reposted;

        if (isReposted) {
          // Unrepost
          await api.reposts.delete(postId);
          repostBtn.classList.remove('reposted');
          isReposted = false;
        } else {
          // Repost
          await api.reposts.create(postId);
          repostBtn.classList.add('reposted');
          isReposted = true;
        }

        // Update repost count - extract only the number from the text
        const currentText = repostCountSpan.textContent.trim();
        const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0') || 0;
        repostCountSpan.innerHTML = `<span class="icon icon-repost">🔄</span> ${isReposted ? currentCount + 1 : currentCount - 1}`;
      } catch (error) {
        console.error('Repost hatası:', error);
        alert('Repost işlemi sırasında bir hata oluştu: ' + error.message);
      }
    }

    if (commentBtn) {
      e.preventDefault();
      const postElement = commentBtn.closest('.post');
      const postId = postElement.getAttribute('data-post-id');
      openCommentModal(postId);
    }
  });

  // Realtime Like Polling - Optimized
  let likePollingInterval = null;
  const POLLING_INTERVAL = 30000; // 30 saniye (5 saniyeden artırıldı)

  async function updateLikeCounts() {
    const posts = document.querySelectorAll('.post');

    for (const postElement of posts) {
      const postId = postElement.getAttribute('data-post-id');
      if (!postId) continue;

      try {
        // Like sayısını güncelle (sadece post detayları)
        const response = await api.posts.getById(postId);

        if (response.success && response.data.post) {
          const likeBtn = postElement.querySelector('.like-btn');
          if (likeBtn) {
            const currentText = likeBtn.textContent.trim();
            const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0') || 0;
            const newCount = response.data.post.like_count || 0;

            // Sadece sayı değiştiyse güncelle
            if (currentCount !== newCount) {
              const likeIcon = likeBtn.querySelector('.icon-like');
              const iconText = likeIcon ? likeIcon.textContent : '🤍';
              likeBtn.innerHTML = `<span class="icon icon-like">${iconText}</span> ${newCount}`;
            }
          }

          // Kullanıcının like durumunu kontrol et (sadece authenticated ise)
          // Not: Like durumu kullanıcı like/unlike yaptığında güncellenir, polling'de kaldırıldı
        }
      } catch (error) {
        console.error('Like sayısı güncelleme hatası:', error);
      }
    }
  }

  // Polling'i başlat
  function startLikePolling() {
    if (likePollingInterval) {
      clearInterval(likePollingInterval);
    }
    likePollingInterval = setInterval(updateLikeCounts, POLLING_INTERVAL);
  }

  // Polling'i durdur
  function stopLikePolling() {
    if (likePollingInterval) {
      clearInterval(likePollingInterval);
      likePollingInterval = null;
    }
  }

  // Sayfa yüklendiğinde polling'i başlat
  startLikePolling();

  // Sayfa görünürlüğü değiştiğinde polling'i yönet
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopLikePolling();
    } else {
      startLikePolling();
    }
  });

  // ==========================================
  //   SEARCH FUNCTIONALITY
  // ==========================================

  const searchInput = document.getElementById('search-input');
  const searchLoading = document.getElementById('search-loading');
  const searchSection = document.getElementById('search-section');
  const searchResults = document.getElementById('search-results');
  const searchQueryDisplay = document.getElementById('search-query-display');
  const searchTabs = document.querySelectorAll('.search-tab');

  let currentSearchType = 'posts'; // 'posts' or 'users'
  let currentSearchQuery = '';
  let isSearching = false;

  // Search tabs functionality
  searchTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const searchType = this.getAttribute('data-search-type');
      
      // Remove active class from all tabs
      searchTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Update current search type
      currentSearchType = searchType;
      
      // Perform search if there's a query
      if (currentSearchQuery) {
        performSearch(currentSearchQuery);
      }
    });
  });

  // Search function
  async function performSearch(query) {
    if (!query || query.trim().length === 0) {
      return;
    }

    currentSearchQuery = query.trim();
    isSearching = true;

    // Show loading
    searchLoading.classList.add('active');
    searchResults.innerHTML = `
      <div class="search-results loading">
        <div class="search-loading-large">
          <div class="search-loading-large-spinner"></div>
          <div class="search-loading-large-text">Aranıyor...</div>
        </div>
      </div>
    `;

    try {
      let response;
      if (currentSearchType === 'posts') {
        response = await api.search.searchPosts(currentSearchQuery);
      } else {
        response = await api.search.searchUsers(currentSearchQuery);
      }

      if (response.success) {
        displaySearchResults(response.data, currentSearchType);
      } else {
        searchResults.innerHTML = `
          <div class="search-empty">
            <div class="search-empty-icon">❌</div>
            <div class="search-empty-title">Arama hatası</div>
            <div class="search-empty-description">${response.error?.message || 'Bir hata oluştu'}</div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      searchResults.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">❌</div>
          <div class="search-empty-title">Arama hatası</div>
          <div class="search-empty-description">Bir hata oluştu. Lütfen tekrar deneyin.</div>
        </div>
      `;
    } finally {
      searchLoading.classList.remove('active');
      isSearching = false;
    }
  }

  // Display search results
  function displaySearchResults(data, type) {
    searchQueryDisplay.textContent = `"${currentSearchQuery}" için sonuçlar`;

    if (type === 'posts') {
      displayPostResults(data.posts);
    } else {
      displayUserResults(data.users);
    }
  }

  // Display post results
  function displayPostResults(posts) {
    if (!posts || posts.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">📝</div>
          <div class="search-empty-title">Sonuç bulunamadı</div>
          <div class="search-empty-description">"${currentSearchQuery}" için gönderi bulunamadı.</div>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = '';
    searchResults.classList.remove('loading');

    posts.forEach(post => {
      const postElement = document.createElement('article');
      postElement.className = 'post';
      postElement.setAttribute('data-post-id', post.id);
      postElement.innerHTML = createPostHTML(post);
      searchResults.appendChild(postElement);
    });

    // Update like status for posts
    updateLikeStatusForPosts();
  }

  // Display user results
  function displayUserResults(users) {
    if (!users || users.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">👤</div>
          <div class="search-empty-title">Sonuç bulunamadı</div>
          <div class="search-empty-description">"${currentSearchQuery}" için kullanıcı bulunamadı.</div>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = '';
    searchResults.classList.remove('loading');

    users.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'user-result';
      userElement.innerHTML = `
        <div class="user-result-avatar">${user.avatar_emoji || '🧑'}</div>
        <div class="user-result-info">
          <div class="user-result-name">${user.display_name || user.username}</div>
          <div class="user-result-username">@${user.username}</div>
          ${user.bio ? `<div class="user-result-bio">${user.bio}</div>` : ''}
        </div>
        <div class="user-result-actions">
          <button class="action-btn" onclick="window.location.href='#profile-${user.id}'">Profil</button>
        </div>
      `;
      searchResults.appendChild(userElement);
    });
  }

  // Search input event listener
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        
        if (query.length > 0) {
          // Hide all sections
          document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
          });
          
          // Remove active class from all nav items
          document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
          });
          
          // Show search section
          searchSection.classList.add('active');
          
          // Perform search
          performSearch(query);
        }
      }
    });
  }
});
