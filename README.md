# Beanmart Backend API

Backend API untuk aplikasi e-commerce Beanmart yang dibangun dengan Express.js dan TypeScript.

## Fitur

- RESTful API dengan Express.js
- Type-safe dengan TypeScript
- Struktur database PostgreSQL
- Arsitektur MVC (Model-View-Controller)
- API versioning (v1)
- Validasi data
- Error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Typed superset of JavaScript
- **PostgreSQL** - Database
- **pnpm** - Package manager

## Struktur Database

Database menggunakan PostgreSQL dengan struktur sebagai berikut:

- Users (pembeli)
- User Addresses
- Categories
- Products
- Product Categories
- Product Images
- Product Option Types
- Product Options
- Product Variants
- Variant Images

Lihat file `database.sql` untuk schema lengkap.

## Prasyarat

- Node.js >= 16.x
- PostgreSQL >= 12.x
- pnpm >= 7.x

## Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd beanmart/backend
```

2. Install dependensi:
```bash
pnpm install
```

3. Setup database:
   - Buat database PostgreSQL
   - Jalankan script `database.sql` untuk membuat tabel
   - Konfigurasi koneksi database di `.env`

4. Konfigurasi environment variables:
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda
```

## Development

Jalankan server dalam mode development:
```bash
pnpm run dev
```

Server akan berjalan di `http://localhost:3000`

## Production

Build project:
```bash
pnpm run build
```

Jalankan server:
```bash
pnpm start
```

## API Documentation

### Endpoint Dasar
- Health check: `GET /health`
- API v1: `GET /api/v1`

### API v1 Endpoints

#### Users
- `GET /api/v1/users` - Mendapatkan semua user
- `GET /api/v1/users/:id` - Mendapatkan user berdasarkan ID
- `POST /api/v1/users` - Membuat user baru
- `PUT /api/v1/users/:id` - Mengupdate user
- `DELETE /api/v1/users/:id` - Menghapus user

#### Products
- `GET /api/v1/products` - Mendapatkan semua produk
- `GET /api/v1/products/active` - Mendapatkan produk aktif
- `GET /api/v1/products/:id` - Mendapatkan produk berdasarkan ID
- `GET /api/v1/products/slug/:slug` - Mendapatkan produk berdasarkan slug
- `POST /api/v1/products` - Membuat produk baru
- `PUT /api/v1/products/:id` - Mengupdate produk
- `DELETE /api/v1/products/:id` - Menghapus produk

#### Categories
- `GET /api/v1/categories` - Mendapatkan semua kategori
- `GET /api/v1/categories/:id` - Mendapatkan kategori berdasarkan ID
- `GET /api/v1/categories/slug/:slug` - Mendapatkan kategori berdasarkan slug
- `POST /api/v1/categories` - Membuat kategori baru
- `PUT /api/v1/categories/:id` - Mengupdate kategori
- `DELETE /api/v1/categories/:id` - Menghapus kategori

## Tutorial

Lihat tutorial terpisah untuk:
- [Menjalankan dan Menggunakan API](TUTORIAL_API.md)
- [Menambahkan User](TUTORIAL_ADD_USER.md)
- [Menambahkan Produk](TUTORIAL_ADD_PRODUCT.md)
- [Menambahkan Kategori](TUTORIAL_ADD_CATEGORY.md)

## Struktur Folder

```
src/
├── config/          # Konfigurasi aplikasi
├── controllers/     # Controller untuk menangani request
├── middleware/      # Middleware aplikasi
├── models/          # Model data dan interaksi database
├── routes/          # Routing API
│   └── v1/          # API version 1
├── services/        # Business logic
├── utils/           # Utility functions
├── app.ts           # Konfigurasi Express app
└── server.ts        # Entry point server
```

## License

MIT License