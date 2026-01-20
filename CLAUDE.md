# CLAUDE.md - Bread Social Proje Kılavuzu

Bu doküman, Claude AI asistanına **Bread Social** projesi hakkında kapsamlı bilgi sağlar ve kod yazarken uyması gereken kuralları, kısıtlamaları ve en iyi pratikleri tanımlar.

---

## 📋 İçindekiler

1. [Proje Özeti](#proje-özeti)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Tasarım Felsefesi](#tasarım-felsefesi)
5. [Mimari Kısıtlamalar](#mimari-kısıtlamalar)
6. [Kod Standartları](#kod-standartları)
7. [CSS ve Tasarım Kuralları](#css-ve-tasarım-kuralları)
8. [JavaScript Kuralları](#javascript-kuralları)
9. [Backend Kuralları](#backend-kuralları)
10. [Veritabanı Kuralları](#veritabanı-kuralları)
11. [Güvenlik Gereksinimleri](#güvenlik-gereksinimleri)
12. [Performans Gereksinimleri](#performans-gereksinimleri)
13. [Accessibility (Erişilebilirlik)](#accessibility-erişilebilirlik)
14. [Test Gereksinimleri](#test-gereksinimleri)
15. [Deployment Kuralları](#deployment-kuralları)
16. [Geliştirme İş Akışı](#geliştirme-iş-akışı)
17. [Yasak Uygulamalar](#yasak-uygulamalar)

---

## Proje Özeti

**Bread Social**, Gruvbox renk şemasıyla tasarlanmış, retro/8-bit tarzında bir sosyal medya platformudur.

### Temel Özellikler
- ✅ Retro piksel-sanat estetiği
- ✅ Gruvbox Dark renk paleti
- ✅ Responsive tasarım (desktop → mobile)
- ✅ Post oluşturma, beğenme, yorum, paylaşım
- ✅ Kullanıcı profilleri ve takip sistemi
- ✅ Trending/popüler içerik keşfi
- ❌ **Backend henüz implement edilmemiş** (sadece frontend mock-up)
- ❌ **Veritabanı entegrasyonu yok**
- ❌ **Authentication sistemi yok**

### Hedef Kullanıcılar
- Retro/nostalji seven kullanıcılar
- Minimalist tasarım tercih edenler
- Türkçe konuşan kullanıcılar (arayüz Türkçe)

---

## Teknoloji Stack

### Frontend
- **HTML5**: Semantic HTML, accessibility-first
- **CSS3**: Vanilla CSS, CSS Custom Properties/Variables
- **JavaScript**: ES6+ Vanilla JavaScript (framework yok)
- **Font**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (Google Fonts)

### Backend
- **Runtime**: Node.js (v18+ önerilir)
- **Framework**: Express.js v4.22.1+
- **Server**: HTTP (HTTPS için reverse proxy önerilir)

### DevOps
- **Dev Server**: Nodemon v3.1.11+
- **Package Manager**: npm (yarn veya pnpm kullanma)
- **Version Control**: Git (GitHub)

### Gelecek Entegrasyonlar (Planlanıyor)
- **Database**: Turso (SQLite cloud) veya PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Cloudinary veya AWS S3
- **Email**: SendGrid veya Mailgun

---

## Proje Yapısı

```
bread-social/
├── server.js              # Express server entry point
├── package.json           # NPM configuration
├── package-lock.json      # Dependency lock file
├── .gitignore            # Git ignore patterns
├── CLAUDE.md             # Bu dosya - AI kılavuzu
├── README.md             # Kullanıcı dokümantasyonu (oluşturulacak)
└── public/               # Static frontend files
    ├── index.html        # Ana HTML dosyası (390+ satır)
    ├── css/
    │   └── style.css     # Ana stylesheet (1156+ satır)
    ├── js/
    │   └── app.js        # Client-side JavaScript
    └── assets/           # Statik dosyalar (boş, hazır)
        ├── images/       # (oluşturulacak)
        └── icons/        # (oluşturulacak)
```

### Dosya Organizasyonu Kuralları

**Kısıtlama #1**: Yeni klasörler oluşturmadan önce mevcut yapıyı kullan.
**Kısıtlama #2**: `public/` dışında frontend dosyası koyma.
**Kısıtlama #3**: Backend kodları için `src/` veya `server/` klasörü oluşturulabilir (henüz yok).
**Kısıtlama #4**: Tüm statik asset'ler `public/assets/` altında olmalı.
**Kısıtlama #5**: CSS dosyalarını parçalamak için `css/components/` alt klasörü kullanılabilir.
**Kısıtlama #6**: Utility JavaScript'leri için `js/utils/` alt klasörü kullanılabilir.

---

## Tasarım Felsefesi

### Gruvbox Teması - Renk Paleti

**Kısıtlama #7**: **Yalnızca Gruvbox Dark renk paletini kullan.**
**Kısıtlama #8**: Custom renkler ekleme, sadece mevcut paletten seç.
**Kısıtlama #9**: Renk değişkenleri için CSS Custom Properties kullan (`var(--bg-primary)`).

#### Renk Değişkenleri

```css
/* Background Colors */
--bg-primary: #282828     /* Ana arkaplan (koyu siyah) */
--bg-secondary: #3c3836   /* İkincil arkaplan (açık gri) */
--bg-tertiary: #504945    /* Üçüncül arkaplan (border için) */

/* Foreground Colors */
--fg-primary: #ebdbb2     /* Ana metin rengi (krem) */
--fg-secondary: #d5c4a1   /* İkincil metin (soluk krem) */
--fg-dim: #a89984         /* Soluk metin (placeholder) */

/* Accent Colors */
--color-red: #fb4934      /* Hata, silme, kritik */
--color-green: #b8bb26    /* Başarı, onay */
--color-yellow: #fabd2f   /* Uyarı, vurgu, branding */
--color-blue: #83a598     /* Link, bilgi, primer aksiyon */
--color-purple: #d3869b   /* Özel etiketler */
--color-aqua: #8ec07c     /* Alternatif vurgu */
--color-orange: #fe8019   /* Highlight, önemli */
```

**Kısıtlama #10**: `--color-yellow` branding rengidir (logo için).
**Kısıtlama #11**: `--color-blue` link ve primer butonlar için.
**Kısıtlama #12**: `--color-red` yalnızca destructive işlemler için (silme, hata).
**Kısıtlama #13**: `--color-green` success durumları için.

### Retro/Pixel Art Estetiği

**Kısıtlama #14**: Tüm border'lar `3px solid` olmalı (daha ince kullanma).
**Kısıtlama #15**: Border-radius kullanma (her şey köşeli olmalı).
**Kısıtlama #16**: `image-rendering: pixelated` tüm görsel elementlerde aktif olmalı.
**Kısıtlama #17**: Font: **Press Start 2P** (Google Fonts) her yerde kullanılmalı.
**Kısıtlama #18**: Fallback font: `'Courier New', 'Monaco', 'Lucida Console', monospace`.
**Kısıtlama #19**: Box-shadow kullanımında smooth shadow kullanma (sadece pixel-perfect shadow).
**Kısıtlama #20**: Animasyonlar keskin olmalı (smooth transition kullanma, `0.1s` gibi hızlı).

### Spacing Sistemi

**Kısıtlama #21**: **8px grid sistemi** kullan (4px, 8px, 16px, 24px, 32px).
**Kısıtlama #22**: Belirsiz spacing değerleri kullanma (örn: `padding: 13px` yasak).
**Kısıtlama #23**: CSS değişkenleri kullan:

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

**Kısıtlama #24**: Margin yerine padding tercih et (mümkünse).
**Kısıtlama #25**: Negatif margin kullanma.

---

## Mimari Kısıtlamalar

### Frontend Architecture

**Kısıtlama #26**: **Framework kullanma** (React, Vue, Angular yasak).
**Kısıtlama #27**: Vanilla JavaScript ES6+ kullan.
**Kısıtlama #28**: jQuery veya benzeri kütüphaneler ekleme.
**Kısıtlama #29**: CSS framework'leri kullanma (Bootstrap, Tailwind yasak).
**Kısıtlama #30**: Icon kütüphaneleri kullanma (emoji kullan 🎨).
**Kısıtlama #31**: Bundle tool kullanma (Webpack, Vite) - henüz gerekli değil.
**Kısıtlama #32**: TypeScript kullanma (projenin doğasına ters).
**Kısıtlama #33**: Preprocessor kullanma (SASS, LESS yasak - vanilla CSS kullan).

### Backend Architecture

**Kısıtlama #34**: Express.js dışında framework kullanma.
**Kısıtlama #35**: Middleware'leri sırayla yaz (static → logging → routes).
**Kısıtlama #36**: Tüm route'lar RESTful olmalı.
**Kısıtlama #37**: API endpoint'leri `/api/v1/` prefix'i ile başlamalı.
**Kısıtlama #38**: GraphQL kullanma (REST kullan).
**Kısıtlama #39**: Server-side rendering (SSR) ekleme.

### State Management

**Kısıtlama #40**: Global state için `localStorage` kullan.
**Kısıtlama #41**: Session state için `sessionStorage` kullan.
**Kısıtlama #42**: Redux, Zustand gibi state management kütüphaneleri kullanma.
**Kısıtlama #43**: State değişiklikleri DOM'u direkt manipüle etmeli (re-render yok).

---

## Kod Standartları

### HTML Kuralları

**Kısıtlama #44**: Semantic HTML5 elementleri kullan (`<article>`, `<section>`, `<aside>`).
**Kısıtlama #45**: ID'leri sadece JavaScript için kullan (CSS'de class kullan).
**Kısıtlama #46**: Class isimleri BEM-lite pattern (`post-header`, `nav-item`).
**Kısıtlama #47**: Data attributes: `data-section`, `data-id` vb. JavaScript için kullan.
**Kısıtlama #48**: Alt attribute tüm img elementlerinde zorunlu.
**Kısıtlama #49**: Lang attribute: `<html lang="tr">` (Türkçe içerik için).
**Kısıtlama #50**: Meta viewport tag zorunlu: `width=device-width, initial-scale=1.0`.
**Kısıtlama #51**: Inline style kullanma (tüm stiller CSS'de).
**Kısıtlama #52**: Inline JavaScript kullanma (tüm script'ler ayrı dosyada).
**Kısıtlama #53**: Deprecated HTML elementleri kullanma (`<center>`, `<font>` yasak).

### Accessibility Kuralları

**Kısıtlama #54**: Tüm interaktif elementlerde `aria-label` kullan.
**Kısıtlama #55**: Focus states tüm butonlarda görünür olmalı.
**Kısıtlama #56**: Skip navigation link ekle (ekran okuyucular için).
**Kısıtlama #57**: Heading hiyerarşisi (`h1` → `h2` → `h3`) mantıklı olmalı.
**Kısıtlama #58**: Color-only information kullanma (icon + renk kombinasyonu).
**Kısıtlama #59**: Minimum contrast ratio: 4.5:1 (WCAG AA standardı).
**Kısıtlama #60**: Keyboard navigation tüm özelliklerde çalışmalı.

---

## CSS ve Tasarım Kuralları

### CSS Organizasyonu

**Kısıtlama #61**: CSS dosya yapısı şu sırada:
```css
1. Variables/Custom Properties
2. Reset/Base Styles
3. Layout (Grid, Flexbox)
4. Components
5. Utilities
6. Media Queries (en sonda)
```

**Kısıtlama #62**: Her bölüm yorum başlığıyla ayrılmalı:
```css
/* ========================================== */
/*   SECTION NAME                             */
/* ========================================== */
```

**Kısıtlama #63**: Selector specificity düşük tut (max 3 seviye: `.post .header .title`).
**Kısıtlama #64**: ID selector kullanma CSS'de (`#id` yasak, `.class` kullan).
**Kısıtlama #65**: `!important` kullanma (istisnai durumlar hariç).
**Kısıtlama #66**: Vendor prefix'leri manuel ekleme (PostCSS autoprefixer kullanılacak).

### Layout Kuralları

**Kısıtlama #67**: Ana layout için **Flexbox** kullan.
**Kısıtlama #68**: Grid layout yalnızca card layout'ları için kullan.
**Kısıtlama #69**: Float kullanma (eski teknik, Flexbox kullan).
**Kısıtlama #70**: Position absolute minimum kullan (layout için kullanma).
**Kısıtlama #71**: Sticky navigation için `position: sticky` kullan.
**Kısıtlama #72**: Z-index değerleri belirli aralıkta:
  - Navbar: 100
  - Modals: 200
  - Tooltips: 300
  - Max: 999

**Kısıtlama #73**: Max-width container: `1400px`.
**Kısıtlama #74**: Sidebar genişliği: `260px` (CSS variable: `--sidebar-width`).
**Kısıtlama #75**: Feed max width: `600px` (CSS variable: `--feed-max-width`).

### Responsive Design

**Kısıtlama #76**: Mobile-first yaklaşım kullan (küçük ekrandan büyüğe).
**Kısıtlama #77**: Breakpoint'ler:
```css
/* Mobile Small */
@media (max-width: 400px)

/* Mobile */
@media (max-width: 600px)

/* Tablet Medium */
@media (max-width: 768px)

/* Tablet Large */
@media (max-width: 1024px)

/* Desktop */
@media (max-width: 1280px)

/* Desktop Large */
@media (min-width: 1400px)
```

**Kısıtlama #78**: Tablet'te sağ sidebar gizlenir.
**Kısıtlama #79**: Mobile'da sol sidebar bottom nav olur.
**Kısıtlama #80**: Font-size'lar responsive olmalı (mobilde daha küçük).
**Kısıtlama #81**: Touch target'lar minimum 44x44px olmalı (mobile için).
**Kısıtlama #82**: Horizontal scroll hiçbir ekranda olmamalı.

### Typography

**Kısıtlama #83**: Base font-size: `14px`.
**Kısıtlama #84**: Line-height: `1.6` (okunabilirlik için).
**Kısıtlama #85**: Letter-spacing: Logo için `2px`, normal metin için `normal`.
**Kısıtlama #86**: Font-weight değişiklikleri kullanma (Press Start 2P tek weight).
**Kısıtlama #87**: Text-transform: Butonlar için `uppercase` kullanılabilir.
**Kısıtlama #88**: Emoji kullanımı:
  - Avatar için: 🧑👩🧔👨
  - Icon için: 🏠🔍🔔💬👤🍞❤️🔄📤

---

## JavaScript Kuralları

### Code Style

**Kısıtlama #89**: ES6+ syntax kullan (arrow function, const/let, template literal).
**Kısıtlama #90**: `var` kullanma (sadece `const` ve `let`).
**Kısıtlama #91**: Semicolon kullan (otomatik insertion'a güvenme).
**Kısıtlama #92**: String'ler için template literal kullan: `` `text ${var}` ``.
**Kısıtlama #93**: Single quote `'` kullan (double quote `"` sadece HTML attribute için).
**Kısıtlama #94**: Indent: 2 space (tab kullanma).
**Kısıtlama #95**: Function declaration yerine arrow function kullan (modern yaklaşım).

### DOM Manipulation

**Kısıtlama #96**: `querySelector` ve `querySelectorAll` kullan (jQuery yok).
**Kısıtlama #97**: Event delegation pattern kullan (performance için).
**Kısıtlama #98**: `addEventListener` kullan (`onclick` attribute kullanma).
**Kısıtlama #99**: Event listener'ları cleanup et (memory leak önlemek için).
**Kısıtlama #100**: DOM ready için: `DOMContentLoaded` event dinle.
**Kısıtlama #101**: `innerHTML` yerine `textContent` kullan (XSS güvenliği).
**Kısıtlama #102**: User input'u sanitize et (XSS engellemek için).

### Error Handling

**Kısıtlama #103**: Try-catch block kullan async işlemlerde.
**Kısıtlama #104**: Console.log production'da bırakma (development-only).
**Kısıtlama #105**: Error message'lar kullanıcı dostu olmalı (Türkçe).
**Kısıtlama #106**: Network error'larda retry mekanizması ekle.

### Performance

**Kısıtlama #107**: Debounce kullan search input'ta (her keystroke'ta arama yapma).
**Kısıtlama #108**: Throttle kullan scroll event'lerinde.
**Kısıtlama #109**: Lazy loading kullan görsellerde.
**Kısıtlama #110**: Virtual scrolling kullan uzun listlerde (1000+ item).
**Kısıtlama #111**: RequestAnimationFrame kullan animasyonlarda.

---

## Backend Kuralları

### Express.js Conventions

**Kısıtlama #112**: Middleware order:
```javascript
1. Body parser
2. CORS
3. Static files
4. Logging
5. Authentication
6. Routes
7. Error handler (en son)
```

**Kısıtlama #113**: Environment variables `.env` dosyasında sakla.
**Kısıtlama #114**: `.env` dosyasını git'e commit etme (.gitignore'da).
**Kısıtlama #115**: PORT varsayılan: `3000`.
**Kısıtlama #116**: Process.env.NODE_ENV kontrol et (`development`, `production`).
**Kısıtlama #117**: Helmet.js kullan güvenlik için (HTTP headers).
**Kısıtlama #118**: CORS policy belirle (wildcard `*` kullanma production'da).

### API Design

**Kısıtlama #119**: RESTful convention'ları takip et:
```
GET    /api/v1/posts       → Tüm postlar
GET    /api/v1/posts/:id   → Tek post
POST   /api/v1/posts       → Yeni post oluştur
PUT    /api/v1/posts/:id   → Post güncelle
DELETE /api/v1/posts/:id   → Post sil
```

**Kısıtlama #120**: HTTP status code'ları doğru kullan:
- 200: OK (success)
- 201: Created
- 204: No Content (başarılı silme)
- 400: Bad Request (validation error)
- 401: Unauthorized (auth gerekli)
- 403: Forbidden (yetki yok)
- 404: Not Found
- 500: Internal Server Error

**Kısıtlama #121**: API response formatı:
```json
{
  "success": true,
  "data": {...},
  "message": "İşlem başarılı",
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**Kısıtlama #122**: Error response formatı:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri",
    "details": [...]
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**Kısıtlama #123**: Pagination zorunlu liste endpoint'lerinde:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Kısıtlama #124**: Rate limiting ekle (örn: 100 request/dakika).
**Kısıtlama #125**: API versioning kullan (`/api/v1/`, `/api/v2/`).

### Logging

**Kısıtlama #126**: Winston veya Pino kullan logging için.
**Kısıtlama #127**: Log seviyeleri: `error`, `warn`, `info`, `debug`.
**Kısıtlama #128**: Production'da debug log'ları kapatın.
**Kısıtlama #129**: Request/Response log'la (timestamp, method, URL, status, duration).
**Kısıtlama #130**: Sensitive data log'lama (password, token yasak).

---

## Veritabanı Kuralları

### Schema Design

**Kısıtlama #131**: Primary key: `id` (integer auto-increment veya UUID).
**Kısıtlama #132**: Timestamp alanları: `created_at`, `updated_at` (otomatik).
**Kısıtlama #133**: Soft delete kullan (deleted_at timestamp, fiziksel silme yapma).
**Kısıtlama #134**: Foreign key constraint'leri tanımla.
**Kısıtlama #135**: Index ekle sık sorgulanan alanlara (username, email).
**Kısıtlama #136**: Enum kullan sabit değerler için (status: active, inactive).

### Örnek Schema

```sql
-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50),
  bio TEXT,
  avatar_emoji VARCHAR(10) DEFAULT '🧑',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Posts Table
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  repost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Follows Table
CREATE TABLE follows (
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id)
);
```

**Kısıtlama #137**: Migration dosyaları oluştur (schema değişiklikleri için).
**Kısıtlama #138**: Seed data dosyası oluştur (test verileri için).
**Kısıtlama #139**: SQL injection'a karşı parameterized query kullan.
**Kısıtlama #140**: Transaction kullan kritik işlemlerde (atomicity).

---

## Güvenlik Gereksinimleri

### Authentication

**Kısıtlama #141**: Password hash için **bcrypt** kullan (10 rounds).
**Kısıtlama #142**: Plain text password saklamak yasak.
**Kısıtlama #143**: JWT kullan token-based auth için.
**Kısıtlama #144**: JWT secret `.env` dosyasında sakla (hard-code etme).
**Kısıtlama #145**: Token expiration: Access token 15 dakika, refresh token 7 gün.
**Kısıtlama #146**: Password minimum: 8 karakter (en az 1 harf, 1 rakam).
**Kısıtlama #147**: Rate limiting ekle login endpoint'ine (brute force koruması).

### Input Validation

**Kısıtlama #148**: Tüm user input'ları validate et (backend'de).
**Kısıtlama #149**: Joi veya Yup kullan validation için.
**Kısıtlama #150**: XSS koruması: HTML encode et user content.
**Kısıtlama #151**: SQL Injection koruması: Parameterized query/ORM kullan.
**Kısıtlama #152**: CSRF token kullan form submission'larda.
**Kısıtlama #153**: File upload: MIME type ve boyut kontrol et.
**Kısıtlama #154**: Max post length: 500 karakter.
**Kısıtlama #155**: Max bio length: 200 karakter.

### HTTPS & Security Headers

**Kısıtlama #156**: Production'da HTTPS zorunlu.
**Kısıtlama #157**: Helmet.js kullan security header'ları için.
**Kısıtlama #158**: CORS policy: Sadece güvenilir origin'lere izin ver.
**Kısıtlama #159**: Content-Security-Policy header ekle.
**Kısıtlama #160**: X-Frame-Options: DENY (clickjacking koruması).

---

## Performans Gereksinimleri

### Frontend Performance

**Kısıtlama #161**: First Contentful Paint (FCP) < 1.5 saniye.
**Kısıtlama #162**: Time to Interactive (TTI) < 3 saniye.
**Kısıtlama #163**: Image optimization: WebP format kullan.
**Kısıtlama #164**: Lazy loading görsellerde: `loading="lazy"`.
**Kısıtlama #165**: Minify CSS ve JavaScript production'da.
**Kısıtlama #166**: Gzip compression aktif olmalı.
**Kısıtlama #167**: Cache-Control header'ları ayarla (static asset'ler için).

### Backend Performance

**Kısıtlama #168**: Database query optimization: N+1 problem çözülmeli.
**Kısıtlama #169**: Redis kullan caching için (frequently accessed data).
**Kısıtlama #170**: Connection pooling kullan database'de.
**Kısıtlama #171**: API response time < 200ms (average).
**Kısıtlama #172**: Pagination: Max 100 item per page.

---

## Test Gereksinimleri

**Kısıtlama #173**: Unit test coverage: Minimum %70.
**Kısıtlama #174**: Jest kullan JavaScript testing için.
**Kısıtlama #175**: Supertest kullan API endpoint testleri için.
**Kısıtlama #176**: E2E test için Playwright veya Cypress kullan.
**Kısıtlama #177**: Test dosya isimlendirme: `filename.test.js` veya `filename.spec.js`.
**Kısıtlama #178**: Mock data kullan testlerde (gerçek DB kullanma).
**Kısıtlama #179**: CI/CD pipeline'da testler otomatik çalışmalı.

---

## Deployment Kuralları

**Kısıtlama #180**: Environment-specific config dosyaları oluştur:
  - `.env.development`
  - `.env.production`
  - `.env.test`

**Kısıtlama #181**: Dockerfile oluştur (container deployment için).
**Kısıtlama #182**: Docker image boyutu minimize et (Alpine Linux kullan).
**Kısıtlama #183**: Health check endpoint ekle: `GET /api/health`.
**Kısıtlama #184**: Graceful shutdown implement et (SIGTERM handle et).
**Kısıtlama #185**: Log'ları stdout/stderr'e yaz (container ortamları için).
**Kısıtlama #186**: Sensitive data environment variable'da sakla (hard-code etme).

---

## Geliştirme İş Akışı

### Git Workflow

**Kısıtlama #187**: Main branch: `main` (master değil).
**Kısıtlama #188**: Feature branch: `feature/feature-name`.
**Kısıtlama #189**: Bugfix branch: `fix/bug-name`.
**Kısıtlama #190**: Commit message format:
```
<type>: <short description>

<detailed description if needed>

Example:
feat: Add user authentication
fix: Resolve login button styling issue
```

**Kısıtlama #191**: Commit type'ları:
  - `feat`: Yeni özellik
  - `fix`: Bug fix
  - `style`: CSS/styling değişiklikleri
  - `refactor`: Kod refactoring
  - `docs`: Dokümantasyon
  - `test`: Test ekleme/düzenleme
  - `chore`: Build, dependency güncellemeleri

**Kısıtlama #192**: Pull Request zorunlu (direkt main'e push yasak).
**Kısıtlama #193**: Code review gerekli (en az 1 onay).
**Kısıtlama #194**: CI/CD check'leri geçmeden merge yasak.

### Code Review Checklist

**Kısıtlama #195**: Kod standartlarına uygun mu?
**Kısıtlama #196**: Güvenlik açığı var mı?
**Kısıtlama #197**: Performance problemi var mı?
**Kısıtlama #198**: Test yazılmış mı?
**Kısıtlama #199**: Dokümantasyon güncellenmiş mi?
**Kısıtlama #200**: Breaking change var mı? (changelog'a ekle)

---

## Yasak Uygulamalar

### Kesinlikle Yapılmaması Gerekenler

**Kısıtlama #201**: ❌ Framework kullanma (React, Vue, Angular yasak).
**Kısıtlama #202**: ❌ CSS framework kullanma (Bootstrap, Tailwind yasak).
**Kısıtlama #203**: ❌ jQuery veya benzeri kütüphane ekleme.
**Kısıtlama #204**: ❌ Gruvbox dışı renk kullanma.
**Kısıtlama #205**: ❌ Border-radius kullanma (köşeli tasarım).
**Kısıtlama #206**: ❌ Smooth shadow/gradient kullanma.
**Kısıtlama #207**: ❌ Press Start 2P dışı font kullanma.
**Kısıtlama #208**: ❌ Inline style yazma.
**Kısıtlama #209**: ❌ Inline JavaScript yazma.
**Kısıtlama #210**: ❌ `var` kullanma (sadece const/let).
**Kısıtlama #211**: ❌ `eval()` kullanma (güvenlik riski).
**Kısıtlama #212**: ❌ Plain text password saklamak.
**Kısıtlama #213**: ❌ Sensitive data log'lamak.
**Kısıtlama #214**: ❌ SQL injection açığı bırakmak.
**Kısıtlama #215**: ❌ XSS açığı bırakmak.
**Kısıtlama #216**: ❌ CORS wildcard (`*`) production'da kullanma.
**Kısıtlama #217**: ❌ Hard-coded secret/API key kullanma.
**Kısıtlama #218**: ❌ Production'da debug log bırakma.
**Kısıtlama #219**: ❌ `.env` dosyasını commit etme.
**Kısıtlama #220**: ❌ `node_modules` commit etme.

---

## Ek Notlar ve Gelecek Planlar

### Öncelikli Geliştirmeler

1. **Backend API Implementasyonu**
   - Express.js route'ları
   - Database entegrasyonu (Turso/PostgreSQL)
   - Authentication sistemi (JWT)

2. **Real-time Özellikler**
   - Socket.io entegrasyonu
   - Live notifications
   - Online user presence

3. **File Upload**
   - Avatar upload
   - Image post support
   - Cloudinary entegrasyonu

4. **Testing Suite**
   - Jest unit tests
   - Supertest API tests
   - Playwright E2E tests

5. **DevOps**
   - Docker containerization
   - CI/CD pipeline (GitHub Actions)
   - Deployment automation

### Önerilen Geliştirme Araçları

- **Code Editor**: VS Code
- **Extensions**: ESLint, Prettier, Live Server
- **API Testing**: Postman, Insomnia
- **Database GUI**: TablePlus, DBeaver
- **Git Client**: GitKraken, SourceTree (opsiyonel)

---

## Son Notlar

Bu doküman, Bread Social projesinin tüm yönlerini kapsamaktadır. **220+ kısıtlama ve kural** ile projenin tutarlılığı, güvenliği ve performansı garanti altına alınmıştır.

### Claude AI için Özel Talimatlar

- **Tüm kısıtlamalara uygun kod yaz**
- **Değişiklik yapmadan önce ilgili bölümü oku**
- **Gruvbox temasını ve retro estetiği koru**
- **Vanilla JavaScript/CSS kullan (framework yok)**
- **Güvenlik ve performansa dikkat et**
- **Accessibility standartlarını uygula**
- **Türkçe dil desteğini koru**

**Eğer bir kısıtlamayı ihlal etmen gerekiyorsa:**
1. Kullanıcıya bildir
2. Alternatif çözüm öner
3. Kullanıcının onayını al

---

**Son Güncelleme**: 2025-01-20
**Versiyon**: 1.0.0
**Durum**: Aktif
**Yazar**: Bread Social Development Team

🍞 **Happy Coding!**
