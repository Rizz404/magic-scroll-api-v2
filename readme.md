# Dokumentasi API Magic Scroll

## Daftar Isi
- [Dokumentasi API Magic Scroll](#dokumentasi-api-magic-scroll)
  - [Daftar Isi](#daftar-isi)
  - [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
    - [Variabel Lingkungan](#variabel-lingkungan)
  - [Struktur Proyek](#struktur-proyek)
  - [Deskripsi Umum](#deskripsi-umum)
  - [Teknologi dan Dependensi](#teknologi-dan-dependensi)
    - [Teknologi Utama](#teknologi-utama)
    - [Dependensi Utama](#dependensi-utama)
    - [Dependensi Pengembangan](#dependensi-pengembangan)
    - [Script NPM](#script-npm)
    - [Fitur Utama](#fitur-utama)
  - [Rute Pengguna](#rute-pengguna)
  - [Rute Tag](#rute-tag)
  - [Rute Izin Catatan](#rute-izin-catatan)
  - [Rute Lampiran Catatan](#rute-lampiran-catatan)
  - [Rute Catatan](#rute-catatan)
  - [Rute Autentikasi](#rute-autentikasi)
  - [Paginasi dan Informasi Tambahan](#paginasi-dan-informasi-tambahan)
    - [Catatan:](#catatan)


## Instalasi dan Konfigurasi

1. Clone repositori
2. Jalankan `npm install` untuk menginstal packagenya
3. Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi kamu sendiri
4. Jalankan `npm run prisma:migrate` untuk menjalankan migrasi database
5. Jalankan `npm run dev` untuk memulai server

### Variabel Lingkungan

Buat file `.env` di root proyek dan isi dengan variabel-variabel berikut:

```
NODE_ENV="development"
PORT=5000
DATABASE_URL_LOCAL="your database local"
DATABASE_URL="your database"
JWT_ACCESS_TOKEN="your token"
JWT_REFRESH_TOKEN="your token"
PROJECT_ID="your firebase project id"
PRIVATE_KEY="your firebase private key"
CLIENT_EMAIL="your client email"
STORAGE_BUCKET="your storage bucket"
```

Ganti nilainya dengan konfigurasi yang sesuai dari anda sendiri.

## Struktur Proyek

```
└── 📁magic-scroll-api-v2
    └── 📁prisma
        └── 📁migrations
        └── schema.prisma
    └── 📁src
        └── 📁config
            └── allowedOrigins.ts
            └── dbConfig.ts
            └── firebaseConfig.ts
        └── 📁constants
            └── note-constant.ts
            └── tag-constant.ts
            └── user-constant.ts
        └── 📁controllers
            └── auth-controller.ts
            └── note-controller.ts
            └── noteAttachment-controller.ts
            └── notePermission-controller.ts
            └── tag-controller.ts
            └── user-controller.ts
        └── 📁middleware
            └── allowedRoles.ts
            └── auth.ts
            └── uploadFile.ts
        └── 📁routes
            └── auth-route.ts
            └── note-route.ts
            └── noteAttachment-route.ts
            └── notePermission-route.ts
            └── tag-route.ts
            └── user-route.ts
        └── 📁seeder
            └── user.ts
        └── 📁types
            └── Prisma.ts
            └── Response.ts
        └── 📁utils
            └── express.ts
            └── firebase.ts
            └── prisma.ts
        └── index.ts
    └── .env
    └── .env.example
    └── .gitignore
    └── package-lock.json
    └── package.json
    └── readme.md
    └── tsconfig.json
```

## Deskripsi Umum

Magic Scroll adalah sebuah aplikasi catatan (notes app) yang dikembangkan menggunakan Node.js dan Express. Aplikasi ini menyediakan berbagai fitur untuk mengelola catatan, pengguna, tag, dan lampiran.

## Teknologi dan Dependensi

### Teknologi Utama

- **Backend**: Node.js dengan Express
- **Database**: PostgreSQL dengan Prisma sebagai ORM
- **Autentikasi**: JWT (JSON Web Tokens)
- **Upload File**: Firebase Storage
- **Keamanan**: bcrypt untuk hashing password, helmet untuk keamanan HTTP header
- **TypeScript**: Untuk pengembangan dengan static typing

### Dependensi Utama

- **express**: Framework web untuk Node.js
- **@prisma/client**: ORM untuk interaksi dengan database
- **@prisma/extension-accelerate**: Ekstensi Prisma untuk peningkatan performa
- **bcrypt**: Untuk hashing password
- **jsonwebtoken**: Implementasi JWT untuk autentikasi
- **firebase-admin**: SDK Admin Firebase untuk manajemen file
- **helmet**: Middleware keamanan untuk Express
- **cors**: Middleware untuk mengatur Cross-Origin Resource Sharing
- **dotenv**: Untuk mengelola variabel lingkungan
- **body-parser**: Middleware untuk parsing body request
- **cookie-parser**: Middleware untuk parsing cookie
- **morgan**: HTTP request logger middleware
- **multer**: Middleware untuk handling multipart/form-data
- **pg**: Driver PostgreSQL untuk Node.js

### Dependensi Pengembangan

- **typescript**: Superset JavaScript dengan static typing
- **@types/***: Definisi tipe untuk package TypeScript
- **nodemon**: Utilitas untuk auto-restart server saat pengembangan
- **ts-node**: Eksekusi TypeScript secara langsung
- **prisma**: CLI dan tooling untuk Prisma ORM
- **@prisma/adapter-pg**: Adapter Prisma untuk PostgreSQL

### Script NPM

- `dev`: Menjalankan server pengembangan dengan nodemon
- `start`: Menjalankan server produksi
- `build`: Mengompilasi TypeScript dan generate Prisma client
- `prisma:migrate`: Menjalankan migrasi database Prisma
- `prisma:studio`: Membuka Prisma Studio untuk manajemen database
- `prisma:generate`: Menghasilkan Prisma client
- `prisma:generate@serverless`: Menghasilkan Prisma client untuk lingkungan serverless
- `prisma:push`: Menyinkronkan skema Prisma dengan database
- `prisma:flush`: Menjalankan script untuk membersihkan database
- `prisma:user-seeder`: Menjalankan seeder untuk data pengguna


### Fitur Utama

1. Manajemen Pengguna (registrasi, login, profil)
2. Manajemen Catatan (CRUD, pencarian, voting, favorit)
3. Manajemen Tag
4. Izin Catatan
5. Lampiran Catatan
6. Autentikasi dan Otorisasi

## Rute Pengguna

URL Dasar: `/api/users`

| Metode | Endpoint               | Deskripsi                                  | Autentikasi              |
| ------ | ---------------------- | ------------------------------------------ | ------------------------ |
| GET    | `/`                    | Mendapatkan semua pengguna                 | Tidak ada                |
| PATCH  | `/`                    | Memperbarui pengguna berdasarkan ID        | Diperlukan               |
| GET    | `/profile`             | Mendapatkan profil pengguna                | Diperlukan               |
| PATCH  | `/profile`             | Memperbarui profil pengguna                | Diperlukan               |
| PATCH  | `/follow/:userId`      | Mengikuti atau berhenti mengikuti pengguna | Diperlukan               |
| GET    | `/search`              | Mencari pengguna berdasarkan nama          | Tidak ada                |
| GET    | `/followings`          | Mendapatkan daftar yang diikuti pengguna   | Diperlukan               |
| GET    | `/followers`           | Mendapatkan daftar pengikut pengguna       | Diperlukan               |
| PATCH  | `/change-role/:userId` | Mengubah peran pengguna                    | Diperlukan (Hanya Admin) |
| PATCH  | `/change-password`     | Mengubah kata sandi pengguna               | Diperlukan               |
| GET    | `/:userId`             | Mendapatkan pengguna berdasarkan ID        | Tidak ada                |
| DELETE | `/:userId`             | Menghapus pengguna                         | Diperlukan               |

## Rute Tag

URL Dasar: `/api/tags`

| Metode | Endpoint  | Deskripsi                      | Autentikasi              |
| ------ | --------- | ------------------------------ | ------------------------ |
| POST   | `/`       | Membuat tag baru               | Diperlukan               |
| GET    | `/`       | Mendapatkan semua tag          | Tidak ada                |
| GET    | `/search` | Mencari tag berdasarkan nama   | Tidak ada                |
| GET    | `/:tagId` | Mendapatkan tag berdasarkan ID | Tidak ada                |
| PATCH  | `/:tagId` | Memperbarui tag berdasarkan ID | Diperlukan (Hanya Admin) |
| DELETE | `/:tagId` | Menghapus tag berdasarkan ID   | Diperlukan (Hanya Admin) |

## Rute Izin Catatan

URL Dasar: `/api/note-permissions`

| Metode | Endpoint        | Deskripsi                              | Autentikasi |
| ------ | --------------- | -------------------------------------- | ----------- |
| GET    | `/note/:noteId` | Mendapatkan izin catatan               | Diperlukan  |
| PATCH  | `/note/:noteId` | Memperbarui atau menambah izin catatan | Diperlukan  |
| DELETE | `/note/:noteId` | Menghapus izin catatan                 | Diperlukan  |

## Rute Lampiran Catatan

URL Dasar: `/api/note-attachments`

| Metode | Endpoint             | Deskripsi                       | Autentikasi |
| ------ | -------------------- | ------------------------------- | ----------- |
| POST   | `/note/:noteId`      | Menambahkan lampiran ke catatan | Diperlukan  |
| DELETE | `/:noteAttachmentId` | Menghapus lampiran              | Diperlukan  |

## Rute Catatan

URL Dasar: `/api/notes`

| Metode | Endpoint            | Deskripsi                                   | Autentikasi |
| ------ | ------------------- | ------------------------------------------- | ----------- |
| POST   | `/`                 | Membuat catatan baru                        | Diperlukan  |
| GET    | `/`                 | Mendapatkan semua catatan                   | Opsional    |
| GET    | `/saved`            | Mendapatkan catatan yang disimpan           | Diperlukan  |
| GET    | `/favorited`        | Mendapatkan catatan favorit                 | Diperlukan  |
| PATCH  | `/upvote/:noteId`   | Memberikan upvote pada catatan              | Diperlukan  |
| PATCH  | `/downvote/:noteId` | Memberikan downvote pada catatan            | Diperlukan  |
| PATCH  | `/save/:noteId`     | Menyimpan catatan                           | Diperlukan  |
| PATCH  | `/favorite/:noteId` | Memfavoritkan catatan                       | Diperlukan  |
| GET    | `/user/:userId`     | Mendapatkan catatan berdasarkan ID pengguna | Opsional    |
| GET    | `/tag/:tagName`     | Mendapatkan catatan berdasarkan nama tag    | Opsional    |
| GET    | `/:noteId`          | Mendapatkan catatan berdasarkan ID          | Opsional    |
| PATCH  | `/:noteId`          | Memperbarui catatan                         | Diperlukan  |

## Rute Autentikasi

URL Dasar: `/api/auth`

| Metode | Endpoint    | Deskripsi                     | Autentikasi |
| ------ | ----------- | ----------------------------- | ----------- |
| POST   | `/register` | Mendaftarkan pengguna baru    | Tidak ada   |
| POST   | `/login`    | Masuk pengguna                | Tidak ada   |
| POST   | `/oauth`    | Masuk dengan OAuth            | Tidak ada   |
| POST   | `/logout`   | Keluar pengguna               | Tidak ada   |
| POST   | `/refresh`  | Memperbarui token autentikasi | Tidak ada   |

## Paginasi dan Informasi Tambahan

Untuk endpoint yang mengembalikan banyak data, API mengimplementasikan sistem paginasi dan mungkin menyertakan informasi tambahan. Berikut adalah struktur umum respons untuk endpoint tersebut:

```json
{
  "data": [], // Array berisi data yang diminta
  "paginationState": {
    "totalData": 0, // Total jumlah data
    "dataPerpage": 10, // Jumlah data per halaman
    "currentPage": 1, // Halaman saat ini
    "totalPages": 1, // Total jumlah halaman
    "startIndex": 1, // Indeks awal data pada halaman ini
    "endIndex": 0, // Indeks akhir data pada halaman ini
    "hasNextPage": false, // Apakah ada halaman selanjutnya
    "hasPrevPage": false // Apakah ada halaman sebelumnya
  },
  "additionalInfo": { // Informasi tambahan (opsional, tergantung endpoint)
    "category": "home",
    "categoryAvailable": ["home", "shared", "private", "self", "deleted", "archived"],
    "order": "new",
    "orderAvailable": ["new", "old", "best", "worst"]
  }
}
```

### Catatan:
- `paginationState` selalu disertakan dalam respons untuk endpoint yang mengembalikan data banyak (yang biasanya berbentuk arrays).
- `additionalInfo` mungkin disertakan tergantung pada endpoint spesifik. Informasi ini dapat mencakup kategori yang tersedia, opsi pengurutan, atau metadata lainnya yang relevan dengan permintaan.
