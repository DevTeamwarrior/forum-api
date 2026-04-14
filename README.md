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
	- Install dependencies
	- Build project (jika perlu)
	- Deploy otomatis ke VPS (menggunakan SSH, rsync, dan PM2)
- File workflow: `.github/workflows/cd.yml`
- Pastikan secret/token deploy (misal: `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`) sudah diatur di GitHub repo Settings > Secrets.

#### Contoh Badge Status
Tambahkan badge berikut di bagian atas README (opsional):

```
![CD](https://github.com/<USERNAME>/<REPO>/actions/workflows/cd.yml/badge.svg)
```

### Screenshot Pipeline
- Sertakan screenshot pipeline CI sukses & gagal, serta pipeline CD sukses, sesuai checklist reviewer.

### Cara Custom Deploy
- Untuk platform lain (Railway, Render, Vercel, Heroku, dsb), ganti langkah deploy di `.github/workflows/cd.yml` sesuai dokumentasi platform.

### Dokumentasi Lengkap
- Semua langkah CI/CD sudah terdokumentasi di README dan file workflow.

## Rate Limiting & HTTPS
Semua endpoint `/threads` dan turunannya dibatasi **90 request/menit per IP** menggunakan NGINX (tidak ada express-rate-limit di backend).
Konfigurasi NGINX ada di file `nginx.conf` (lihat contoh di bawah).
API hanya bisa diakses via HTTPS.

### Contoh nginx.conf (production)
```
limit_req_zone $binary_remote_addr zone=forumapilimit:10m rate=1.5r/s;

server {
	listen 80;
	server_name forumapizxc.cloud;
	return 301 https://$host$request_uri;
}

server {
	listen 443 ssl;
	server_name forumapizxc.cloud;

	ssl_certificate /etc/letsencrypt/live/forumapizxc.cloud/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/forumapizxc.cloud/privkey.pem;

	location /threads {
		limit_req zone=forumapilimit;
		proxy_pass http://localhost:3000;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location / {
		proxy_pass http://localhost:3000;
	}
}
```

**Catatan:**
- Jika melakukan pengujian otomatis (Postman Runner), set delay minimal **700ms** antar request agar tidak diblokir oleh rate limiting NGINX.

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
