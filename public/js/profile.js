// Profile Page Logic
document.addEventListener('DOMContentLoaded', function() {
  let currentUsername = null;
  let currentUserId = null;

  // Load profile data
  async function loadProfile(username) {
    try {
      const response = await api.users.getProfile(username);
      
      if (response.success) {
        const { user, stats } = response.data;
        updateProfileUI(user, stats);
        loadUserPosts(user.id);
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      showError('Profil yüklenirken bir hata oluştu');
    }
  }

  // Update profile UI
  function updateProfileUI(user, stats) {
    currentUserId = user.id;
    currentUsername = user.username;

    // Update profile header
    const profileAvatar = document.querySelector('.profile-avatar-large');
    if (profileAvatar) {
      profileAvatar.textContent = user.avatar_emoji || '🧑';
    }

    const profileDisplayName = document.querySelector('.profile-display-name');
    if (profileDisplayName) {
      profileDisplayName.textContent = user.display_name || user.username;
    }

    const profileUsername = document.querySelector('.profile-username');
    if (profileUsername) {
      profileUsername.textContent = `@${user.username}`;
    }

    const profileBio = document.querySelector('.profile-bio p');
    if (profileBio) {
      profileBio.textContent = user.bio || 'Henüz bio eklenmemiş';
    }

    // Update stats
    const statsElements = document.querySelectorAll('.profile-stat');
    if (statsElements.length >= 3) {
      statsElements[0].querySelector('.stat-value').textContent = stats.posts || 0;
      statsElements[1].querySelector('.stat-value').textContent = formatNumber(stats.followers || 0);
      statsElements[2].querySelector('.stat-value').textContent = formatNumber(stats.following || 0);
    }

    // Update follow button if viewing other user's profile
    updateFollowButton(user.id);
  }

  // Update follow button
  async function updateFollowButton(profileUserId) {
    const followBtn = document.querySelector('.profile-edit-btn');
    if (!followBtn) return;

    // Check if viewing own profile
    api.auth.me().then(response => {
      if (response.success && response.data.user.id === profileUserId) {
        // Show edit button for own profile
        followBtn.textContent = 'Profili Düzenle';
        followBtn.classList.remove('follow-btn');
        followBtn.classList.add('profile-edit-btn');
        followBtn.onclick = () => {
          // Edit profile functionality
          alert('Profil düzenleme özelliği yakında aktif olacak');
        };
      } else {
        // Show follow button for other users
        followBtn.classList.remove('profile-edit-btn');
        followBtn.classList.add('follow-btn');
        
        // Check if already following
        api.follows.checkFollow(profileUserId).then(checkResponse => {
          if (checkResponse.success && checkResponse.data.following) {
            followBtn.textContent = 'Takibi Bırak';
            followBtn.classList.add('following');
          } else {
            followBtn.textContent = 'Takip Et';
            followBtn.classList.remove('following');
          }
        }).catch(() => {
          followBtn.textContent = 'Takip Et';
          followBtn.classList.remove('following');
        });

        // Add follow/unfollow handler
        followBtn.onclick = async () => {
          try {
            const checkResponse = await api.follows.checkFollow(profileUserId);
            
            if (checkResponse.success && checkResponse.data.following) {
              // Unfollow
              await api.follows.unfollow(profileUserId);
              followBtn.textContent = 'Takip Et';
              followBtn.classList.remove('following');
              
              // Update follower count
              const followerCount = statsElements[1].querySelector('.stat-value');
              const currentCount = parseInt(followerCount.textContent.replace(/[^0-9]/g, '')) || 0;
              followerCount.textContent = formatNumber(currentCount - 1);
            } else {
              // Follow
              await api.follows.follow(profileUserId);
              followBtn.textContent = 'Takibi Bırak';
              followBtn.classList.add('following');
              
              // Update follower count
              const followerCount = statsElements[1].querySelector('.stat-value');
              const currentCount = parseInt(followerCount.textContent.replace(/[^0-9]/g, '')) || 0;
              followerCount.textContent = formatNumber(currentCount + 1);
            }
          } catch (error) {
            console.error('Follow hatası:', error);
            alert('Takip işlemi sırasında bir hata oluştu: ' + error.message);
          }
        };
      }
    }).catch(() => {
      // Not authenticated, hide follow button
      followBtn.style.display = 'none';
    });
  }

  // Load user posts
  async function loadUserPosts(userId, page = 1) {
    try {
      const response = await api.users.getUserPosts(userId, page);
      
      if (response.success) {
        const postsContainer = document.querySelector('#posts-tab');
        if (postsContainer) {
          postsContainer.innerHTML = '';
          
          if (response.data.posts.length === 0) {
            postsContainer.innerHTML = `
              <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-title">Henüz gönderi yok</div>
                <div class="empty-description">İlk gönderini paylaşmaya başla!</div>
              </div>
            `;
          } else {
            response.data.posts.forEach(post => {
              postsContainer.innerHTML += createPostHTML(post);
            });
          }
        }
      }
    } catch (error) {
      console.error('Gönderiler yüklenirken hata:', error);
    }
  }

  // Format number (e.g., 1200 -> 1.2K)
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Show error message
  function showError(message) {
    const profileSection = document.querySelector('#profile-section');
    if (profileSection) {
      profileSection.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <div class="empty-title">Hata</div>
          <div class="empty-description">${message}</div>
        </div>
      `;
    }
  }

  // Check if we're on profile section
  function checkProfileSection() {
    const profileSection = document.getElementById('profile-section');
    if (profileSection && profileSection.classList.contains('active')) {
      // Get username from URL or use current user
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('username');
      
      if (username) {
        loadProfile(username);
      } else {
        // Load current user's profile
        api.auth.me().then(response => {
          if (response.success) {
            loadProfile(response.data.user.username);
          }
        }).catch(() => {
          showError('Giriş yapmalısınız');
        });
      }
    }
  }

  // Listen for navigation changes
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      setTimeout(checkProfileSection, 100);
    });
  });

  // Initial check
  checkProfileSection();
});
