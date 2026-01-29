require('dotenv').config();
const { db, initDatabase } = require('../config/database');
const crypto = require('crypto');

const avatarEmojis = ['🧑', '👨', '👩', '🧔', '👴', '👵', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳'];
const firstNames = ['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Emre', 'Deniz', 'Can', 'Elif', 'Zeynep'];
const lastNames = ['Yılmaz', 'Demir', 'Çelik', 'Şahin', 'Arslan', 'Kaya', 'Koç', 'Kurt', 'Özdemir', 'Çetin'];
const bios = [
  'Teknoloji meraklısı 💻',
  'Oyun sever 🎮',
  'Müzik tutkunu 🎵',
  'Seyahat ediyor 🌍',
  'Fotoğrafçı 📷',
  'Yazılım geliştirici 👨‍💻',
  'Kitap kurdu 📚',
  'Spor yapmayı seviyor 🏃',
  'Yemek yapmak hobim 🍳',
  'Sinema hastası 🎬'
];
const postContents = [
  'Bugün harika bir gün! 🌞',
  'Yeni bir şeyler öğrendim, çok mutluyum! 📚',
  'Hava çok güzel, dışarı çıkmalı! ☀️',
  'Kod yazmak beni mutlu ediyor 💻',
  'Yeni bir proje başlattım, heyecanlıyım! 🚀',
  'Arkadaşlarımla buluştum, çok eğlendik! 🎉',
  'En sevdiğim filmi izledim 🎬',
  'Kahvemle sabah kahvesi, hayat güzel ☕',
  'Yemek yapmayı öğreniyorum 🍳',
  'Yeni bir müzik keşfettim! 🎵'
];

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function getRandomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

function generatePostContent() {
  return postContents[Math.floor(Math.random() * postContents.length)];
}

async function seedDatabase() {
  try {
    console.log('Veritabanı seed işlemi başlıyor...');
    
    // Önce tüm verileri temizle
    console.log('Mevcut verileri temizliyorum...');
    await db.execute('DELETE FROM reposts');
    await db.execute('DELETE FROM comments');
    await db.execute('DELETE FROM likes');
    await db.execute('DELETE FROM follows');
    await db.execute('DELETE FROM posts');
    await db.execute('DELETE FROM users');
    
    console.log('100 kullanıcı oluşturuyorum...');
    
    const passwordHash = await hashPassword('Password123');
    const users = [];
    
    // 100 kullanıcı oluştur
    for (let i = 1; i <= 100; i++) {
      const username = `user${i}`;
      const email = `user${i}@example.com`;
      const displayName = `${firstNames[(i-1) % 10]} ${lastNames[(i-1) % 10]}`;
      const avatarEmoji = avatarEmojis[(i-1) % 10];
      const bio = bios[(i-1) % 10];
      
      const result = await db.execute({
        sql: `INSERT INTO users (username, email, password_hash, display_name, bio, avatar_emoji, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [username, email, passwordHash, displayName, bio, avatarEmoji]
      });
      
      const userId = result.lastInsertRowid;
      users.push({ id: userId, username });
      if (i % 10 === 0) console.log(`${i}/100 kullanıcı oluşturuldu`);
    }
    
    console.log('Her kullanıcı için 25-30 paylaşım oluşturuyorum...');
    
    // Her kullanıcı için 25-30 post oluştur
    for (let idx = 0; idx < users.length; idx++) {
      const user = users[idx];
      const numPosts = Math.floor(Math.random() * 6) + 25; // 25-30 arası
      
      for (let j = 0; j < numPosts; j++) {
        const content = generatePostContent();
        const createdAt = getRandomDate(30);
        
        await db.execute({
          sql: `INSERT INTO posts (user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)`,
          args: [user.id, content, createdAt, createdAt]
        });
      }
      
      if ((idx + 1) % 10 === 0) {
        console.log(`${idx + 1}/100 kullanıcı için postlar oluşturuldu`);
      }
    }
    
    console.log('Rastgele takip ilişkileri oluşturuyorum...');
    for (let i = 0; i < users.length; i++) {
      const numFollows = Math.floor(Math.random() * 10) + 1;
      const followedUsers = new Set();
      
      while (followedUsers.size < numFollows) {
        const randomIdx = Math.floor(Math.random() * users.length);
        if (randomIdx !== i) {
          followedUsers.add(users[randomIdx].id);
        }
      }
      
      for (const followedId of followedUsers) {
        try {
          await db.execute({
            sql: `INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, datetime('now'))`,
            args: [users[i].id, followedId]
          });
        } catch (e) {
          // Ignore duplicate errors
        }
      }
    }
    
    console.log('✅ Seed işlemi başarıyla tamamlandı!');
    console.log(`📊 Toplam: ${users.length} kullanıcı, yaklaşık ${users.length * 27} post`);
    
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
