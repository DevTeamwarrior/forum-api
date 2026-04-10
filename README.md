# Forum API

Forum API adalah RESTful API untuk aplikasi diskusi online.

## Fitur Utama
- Autentikasi JWT
- Thread, Comment, Reply
- Like/Unlike Comment
- Rate Limiting & HTTPS (NGINX)
- CI/CD (GitHub Actions)

## Setup
1. Clone repo
2. Install dependencies: `npm install`
3. Copy `.env.example` ke `.env` dan isi value-nya
4. Jalankan migrasi & seed database
5. Jalankan server: `npm start`

## Testing
- Jalankan test: `npm test`
- Cek coverage: `npm run coverage`

## CI/CD (GitHub Actions)

### Continuous Integration (CI)
- Workflow CI otomatis berjalan pada setiap pull request ke branch utama (`main`/`master`).
- CI akan menjalankan:
	- Install dependencies
	- Lint kode (`npm run lint`)
	- Setup database PostgreSQL untuk test
	- Jalankan seluruh test (`npm test`)
- File workflow: `.github/workflows/ci.yml`

#### Contoh Badge Status
Tambahkan badge berikut di bagian atas README (opsional):

```
![CI](https://github.com/<USERNAME>/<REPO>/actions/workflows/ci.yml/badge.svg)
```

### Continuous Deployment (CD)
- Workflow CD otomatis berjalan pada setiap push ke branch utama (`main`/`master`).
- CD akan menjalankan:
	- Install Railway CLI (atau CLI platform lain)
	- Deploy otomatis ke server (Railway/Render/Vercel/dsb)
- File workflow: `.github/workflows/cd.yml`
- Pastikan secret/token deploy sudah diatur di GitHub repo Settings > Secrets (misal: `RAILWAY_TOKEN`).

#### Contoh Badge Status
Tambahkan badge berikut di bagian atas README (opsional):

```
![CD](https://github.com/<USERNAME>/<REPO>/actions/workflows/cd.yml/badge.svg)
```

### Screenshot Pipeline
- Sertakan screenshot pipeline CI sukses & gagal, serta pipeline CD sukses, sesuai checklist reviewer.

### Cara Custom Deploy
- Untuk platform lain (Render, Vercel, Heroku, dsb), ganti langkah deploy di `.github/workflows/cd.yml` sesuai dokumentasi platform.

### Dokumentasi Lengkap
- Semua langkah CI/CD sudah terdokumentasi di README dan file workflow.

## Rate Limiting & HTTPS
- Semua endpoint /threads dan turunannya dibatasi 90 request/menit per IP (express-rate-limit & NGINX).
- Contoh implementasi express-rate-limit:

```js
// src/app.js
import rateLimit from 'express-rate-limit';

const threadsLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 menit
	max: 90, // max 90 request per IP
	message: { status: 'fail', message: 'Terlalu banyak request, coba lagi nanti.' },
});

app.use('/threads', threadsLimiter);
```

- Konfigurasi NGINX ada di `nginx.conf` (lihat contoh di bawah).
- API hanya bisa diakses via HTTPS.

### Contoh nginx.conf
```
http {
	limit_req_zone $binary_remote_addr zone=threads:10m rate=90r/m;
	server {
		listen 443 ssl;
		server_name forumapi.dcdg.xyz;
		ssl_certificate /etc/letsencrypt/live/yourdomain/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/yourdomain/privkey.pem;

		location /threads/ {
			limit_req zone=threads burst=10 nodelay;
			proxy_pass http://localhost:3000;
			# ...proxy config lain...
		}
	}
}
```

## Environment Variable
Lihat `.env.example` untuk daftar variable yang dibutuhkan.

## Dokumentasi Endpoint

### Autentikasi
#### POST /authentications
- Login user
- Body: `{ username, password }`
- Response: `{ accessToken, refreshToken }`

#### POST /users
- Register user
- Body: `{ username, password, fullname }`
- Response: `{ addedUser: { id, username, fullname } }`

### Thread
#### POST /threads
- Buat thread baru
- Header: Authorization: Bearer <token>
- Body: `{ title, body }`
- Response: `{ addedThread: { id, title, owner } }`

#### GET /threads/{threadId}
- Ambil detail thread (beserta comments, replies, likeCount)
- Response: `{ thread: { id, title, body, date, username, comments: [...] } }`

### Comment
#### POST /threads/{threadId}/comments
- Tambah comment ke thread
- Header: Authorization: Bearer <token>
- Body: `{ content }`
- Response: `{ addedComment: { id, content, owner } }`

#### DELETE /threads/{threadId}/comments/{commentId}
- Hapus comment
- Header: Authorization: Bearer <token>
- Response: `{ }`

### Reply
#### POST /threads/{threadId}/comments/{commentId}/replies
- Tambah reply ke comment
- Header: Authorization: Bearer <token>
- Body: `{ content }`
- Response: `{ addedReply: { id, content, owner } }`

#### DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}
- Hapus reply
- Header: Authorization: Bearer <token>
- Response: `{ }`

### Like/Unlike Comment
#### PUT /threads/{threadId}/comments/{commentId}/likes
- Like/unlike comment
- Header: Authorization: Bearer <token>
- Response: `{ }`

---

**Catatan:**
- Hapus `node_modules` sebelum submit
- Jangan upload file `.env` ke repo publik
