// User Profile Page JavaScript

let currentProfileUser = null;
let currentUserId = null;
let isFollowing = false;

// Get username from URL parameters
function getUsernameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('username');
}

// Load user profile data
async function loadUserProfile(username) {
  try {
    const response = await api.users.getProfile(username);
    
    if (response.success) {
      currentProfileUser = response.data.user;
      currentUserId = response.data.user.id;
      
      // Update profile UI
      updateProfileUI(response.data.user, response.data.stats);
      
      // Load user posts
      await loadUserPosts(currentUserId);
      
      // Check follow status if authenticated
      if (Auth.isAuthenticated) {
        await checkFollowStatus();
      }
    } else {
      showProfileError('Kullanıcı bulunamadı');
    }
  } catch (error) {
    console.error('Profil yükleme hatası:', error);
    showProfileError('Profil yüklenirken bir hata oluştu');
  }
}

// Update profile UI with user data
function updateProfileUI(user, stats) {
  // Profile avatar
  document.getElementById('profile-avatar').textContent = user.avatar_emoji || '🧑';
  
  // Profile names
  document.getElementById('profile-display-name').textContent = user.display_name || user.username;
  document.getElementById('profile-username').textContent = `@${user.username}`;
  
  // Back button info
  document.getElementById('profile-back-name').textContent = user.display_name || user.username;
  document.getElementById('profile-back-posts').textContent = `${stats.posts_count || 0} gönderi`;
  
  // Profile bio
  const bioElement = document.getElementById('profile-bio');
  if (user.bio) {
    bioElement.innerHTML = `<p>${user.bio}</p>`;
  } else {
    bioElement.innerHTML = '<p class="bio-empty">Henüz bio eklenmemiş.</p>';
  }
  
  // Profile stats
  document.getElementById('profile-posts-count').textContent = stats.posts_count || 0;
  document.getElementById('profile-followers-count').textContent = stats.followers_count || 0;
  document.getElementById('profile-following-count').textContent = stats.following_count || 0;
  
  // Show appropriate action button
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const followBtn = document.getElementById('profile-follow-btn');
  const editBtn = document.getElementById('profile-edit-btn');
  
  if (Auth.isAuthenticated && currentUser.id === user.id) {
    // Own profile - show edit button
    editBtn.style.display = 'block';
    followBtn.style.display = 'none';
  } else if (Auth.isAuthenticated) {
    // Other user's profile - show follow button
    followBtn.style.display = 'block';
    editBtn.style.display = 'none';
  } else {
    // Not authenticated - hide both buttons
    followBtn.style.display = 'none';
    editBtn.style.display = 'none';
  }
  
  // Update page title
  document.title = `${user.display_name || user.username} (@${user.username}) - Bread Social`;
}

// Load user posts
async function loadUserPosts(userId) {
  const postsContainer = document.getElementById('profile-posts');
  
  try {
    const response = await api.users.getUserPosts(userId);
    
    if (response.success) {
      postsContainer.innerHTML = '';
      
      if (response.data.posts.length === 0) {
        postsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-title">Henüz gönderi yok</div>
            <div class="empty-description">Bu kullanıcı henüz hiçbir gönderi paylaşmamış.</div>
          </div>
        `;
      } else {
        response.data.posts.forEach(post => {
          const postElement = document.createElement('article');
          postElement.className = 'post';
          postElement.setAttribute('data-post-id', post.id);
          postElement.innerHTML = createPostHTML(post);
          postsContainer.appendChild(postElement);
        });
        
        // Update like status for posts
        await updateLikeStatusForPosts();
      }
    }
  } catch (error) {
    console.error('Kullanıcı postları yükleme hatası:', error);
    postsContainer.innerHTML = `
      <div class="error">Gönderiler yüklenirken bir hata oluştu</div>
    `;
  }
}

// Check follow status
async function checkFollowStatus() {
  if (!currentUserId) return;
  
  try {
    const response = await api.follows.checkFollow(currentUserId);
    
    if (response.success) {
      isFollowing = response.data.following;
      updateFollowButton();
    }
  } catch (error) {
    console.error('Takip durumu kontrol hatası:', error);
  }
}

// Update follow button
function updateFollowButton() {
  const followBtn = document.getElementById('profile-follow-btn');
  
  if (isFollowing) {
    followBtn.textContent = 'Takibi Bırak';
    followBtn.classList.add('following');
  } else {
    followBtn.textContent = 'Takip Et';
    followBtn.classList.remove('following');
  }
}

// Handle follow/unfollow
async function handleFollowToggle() {
  if (!Auth.isAuthenticated) {
    Auth.showLoginModal();
    return;
  }
  
  if (!currentUserId) return;
  
  try {
    if (isFollowing) {
      await api.follows.unfollow(currentUserId);
      isFollowing = false;
      
      // Update follower count
      const followersCount = document.getElementById('profile-followers-count');
      const currentCount = parseInt(followersCount.textContent) || 0;
      followersCount.textContent = Math.max(0, currentCount - 1);
    } else {
      await api.follows.follow(currentUserId);
      isFollowing = true;
      
      // Update follower count
      const followersCount = document.getElementById('profile-followers-count');
      const currentCount = parseInt(followersCount.textContent) || 0;
      followersCount.textContent = currentCount + 1;
    }
    
    updateFollowButton();
  } catch (error) {
    console.error('Takip işlemi hatası:', error);
    alert('Takip işlemi sırasında bir hata oluştu: ' + error.message);
  }
}

// Show profile error
function showProfileError(message) {
  const feedElement = document.querySelector('.feed');
  feedElement.innerHTML = `
    <div class="profile-error">
      <div class="error-icon">❌</div>
      <div class="error-title">Profil Yüklenemedi</div>
      <div class="error-message">${message}</div>
      <button class="error-btn" onclick="history.back()">← Geri Dön</button>
    </div>
  `;
}

// Update Like Status for Posts (same as app.js)
async function updateLikeStatusForPosts() {
  if (!Auth.isAuthenticated) return;

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

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize auth
  await Auth.init();
  
  // Get username from URL
  const username = getUsernameFromURL();
  
  if (!username) {
    showProfileError('Kullanıcı adı belirtilmemiş');
    return;
  }
  
  // Load user profile
  await loadUserProfile(username);
  
  // Profile tabs functionality
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
  
  // Follow button event listener
  const followBtn = document.getElementById('profile-follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', handleFollowToggle);
  }
  
  // Edit profile button (redirect to main profile page)
  const editBtn = document.getElementById('profile-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      window.location.href = '/#profile';
    });
  }
  
  // Event delegation for post actions
  document.addEventListener('click', async function(e) {
    const likeBtn = e.target.closest('.like-btn');
    const repostBtn = e.target.closest('.repost-btn');
    const commentBtn = e.target.closest('.comment-btn');

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

        // Update like count
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

        // Update repost count
        const currentText = repostCountSpan.textContent.trim();
        const currentCount = parseInt(currentText.match(/\d+/)?.[0] || '0') || 0;
        repostCountSpan.innerHTML = `<span class="icon icon-repost">🔄</span> ${isReposted ? currentCount + 1 : currentCount - 1}`;
      } catch (error) {
        console.error('Repost hatası:', error);
        alert('Repost işlemi sırasında bir hata oluştu: ' + error.message);
      }
    }
  });
});