# Tutorial: Menjalankan dan Menggunakan API Beanmart

## Deskripsi
Tutorial ini menjelaskan cara menjalankan server API Beanmart dan menggunakannya untuk mengelola data aplikasi.

## Prasyarat
1. Node.js dan pnpm sudah terinstal
2. Database PostgreSQL sudah terinstal dan berjalan
3. Koneksi internet

## Langkah-langkah

### 1. Instalasi Dependensi
Setelah meng-clone repository, instal semua dependensi yang dibutuhkan:
```bash
pnpm install
```

### 2. Konfigurasi Database
Pastikan konfigurasi database di file `.env` sudah sesuai:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beanmart
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Membuat Database dan Tabel
Jalankan perintah SQL dari file `database.sql` untuk membuat struktur database:
```sql
-- Jalankan perintah ini di PostgreSQL
-- USERS (pembeli)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  full_name text,
  password_hash text,
  created_at timestamptz not null default now()
);
-- Dan seterusnya untuk semua tabel...
```

### 4. Menjalankan Server dalam Mode Development
Untuk menjalankan server dalam mode development (dengan auto-restart saat ada perubahan):
```bash
pnpm run dev
```

Server akan berjalan di `http://localhost:3000`

### 5. Menjalankan Server dalam Mode Production
Untuk menjalankan server dalam mode production:
```bash
# Build terlebih dahulu
pnpm run build

# Jalankan server
pnpm run start
```

### 6. Endpoint API yang Tersedia
Setelah server berjalan, API dapat diakses melalui:
- Health check: `http://localhost:3000/health`
- API v1: `http://localhost:3000/api/v1`

#### Endpoint Users:
- `GET /api/v1/users` - Mendapatkan semua user
- `GET /api/v1/users/:id` - Mendapatkan user berdasarkan ID
- `POST /api/v1/users` - Membuat user baru
- `PUT /api/v1/users/:id` - Mengupdate user
- `DELETE /api/v1/users/:id` - Menghapus user

#### Endpoint Products:
- `GET /api/v1/products` - Mendapatkan semua produk
- `GET /api/v1/products/active` - Mendapatkan produk aktif
- `GET /api/v1/products/:id` - Mendapatkan produk berdasarkan ID
- `GET /api/v1/products/slug/:slug` - Mendapatkan produk berdasarkan slug
- `POST /api/v1/products` - Membuat produk baru
- `PUT /api/v1/products/:id` - Mengupdate produk
- `DELETE /api/v1/products/:id` - Menghapus produk

#### Endpoint Categories:
- `GET /api/v1/categories` - Mendapatkan semua kategori
- `GET /api/v1/categories/:id` - Mendapatkan kategori berdasarkan ID
- `GET /api/v1/categories/slug/:slug` - Mendapatkan kategori berdasarkan slug
- `POST /api/v1/categories` - Membuat kategori baru
- `PUT /api/v1/categories/:id` - Mengupdate kategori
- `DELETE /api/v1/categories/:id` - Menghapus kategori

### 7. Contoh Penggunaan API
Menggunakan curl untuk mengakses API:

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Membuat User Baru
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "full_name": "User Contoh"
  }'
```

#### Mendapatkan Semua User
```bash
curl http://localhost:3000/api/v1/users
```

#### Mendapatkan User Berdasarkan ID
```bash
curl http://localhost:3000/api/v1/users/{user_id}
```

### 8. Testing dengan Postman
1. Buka Postman
2. Import collection (jika tersedia)
3. Atau buat request baru untuk setiap endpoint
4. Gunakan method HTTP yang sesuai (GET, POST, PUT, DELETE)
5. Tambahkan headers:
   - `Content-Type: application/json` untuk request dengan body JSON

### 9. Struktur Folder Project
```
backend/
├── src/
│   ├── config/          # Konfigurasi aplikasi
│   ├── controllers/     # Controller untuk menangani request
│   ├── middleware/      # Middleware aplikasi
│   ├── models/          # Model data dan interaksi database
│   ├── routes/          # Routing API
│   │   └── v1/          # API version 1
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.ts           # Konfigurasi Express app
│   └── server.ts        # Entry point server
├── dist/                # Compiled JavaScript files
├── .env                 # Environment variables
├── database.sql         # Database schema
├── package.json         # Dependencies dan scripts
├── tsconfig.json        # TypeScript configuration
└── nodemon.json         # Nodemon configuration
```

### 10. Troubleshooting
#### Server tidak bisa diakses:
- Pastikan port 3000 tidak digunakan oleh aplikasi lain
- Periksa apakah server sudah berjalan dengan perintah `pnpm run dev`

#### Database connection error:
- Pastikan PostgreSQL sudah berjalan
- Periksa kembali konfigurasi database di `.env`
- Pastikan database `beanmart` sudah dibuat

#### Error saat build:
- Pastikan semua dependensi sudah diinstall dengan `pnpm install`
- Periksa apakah tidak ada error TypeScript

#### Error saat menjalankan query:
- Pastikan semua tabel sudah dibuat sesuai `database.sql`
- Periksa apakah field-field yang digunakan sesuai dengan schema database

### 11. Development Workflow
1. Jalankan server development: `pnpm run dev`
2. Lakukan perubahan pada file di folder `src/`
3. Server akan otomatis restart saat ada perubahan
4. Test perubahan melalui API endpoints
5. Untuk production, build dan jalankan: `pnpm run build` dan `pnpm run start`