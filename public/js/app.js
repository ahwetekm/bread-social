// Section Navigation
document.addEventListener('DOMContentLoaded', function() {
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
    postSubmitBtn.addEventListener('click', function() {
      const postText = newPostTextarea.value.trim();

      if (postText === '') return;

      // Create new post element
      const postsContainer = document.querySelector('.posts');
      const newPost = document.createElement('article');
      newPost.className = 'post';

      const now = new Date();
      const timeAgo = 'şimdi';

      newPost.innerHTML = `
        <div class="post-header">
          <div class="post-avatar">🧑</div>
          <div class="post-author">
            <div class="post-name">Ahmet Yılmaz</div>
            <div class="post-handle">@ahmetyilmaz · ${timeAgo}</div>
          </div>
        </div>
        <div class="post-content">
          ${postText}
        </div>
        <div class="post-actions">
          <button class="action-btn"><span class="icon icon-comment">💬</span> 0</button>
          <button class="action-btn"><span class="icon icon-repost">🔄</span> 0</button>
          <button class="action-btn"><span class="icon icon-like">❤️</span> 0</button>
          <button class="action-btn"><span class="icon icon-share">📤</span></button>
        </div>
      `;

      // Add to top of feed
      if (postsContainer) {
        postsContainer.insertBefore(newPost, postsContainer.firstChild);
      }

      // Close modal
      closeNewPostModal();

      // Scroll to new post
      newPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Close with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (newPostModal.classList.contains('active')) {
        closeNewPostModal();
      }
    }
  });
});
