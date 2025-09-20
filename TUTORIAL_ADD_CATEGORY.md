# Tutorial: Menambahkan Kategori ke Sistem Beanmart

## Deskripsi
Tutorial ini menjelaskan cara menambahkan kategori baru ke sistem Beanmart menggunakan API endpoint yang tersedia.

## Prasyarat
1. Server backend Beanmart sudah berjalan
2. Tools yang dibutuhkan:
   - Postman, curl, atau tool HTTP client lainnya
   - Koneksi internet

## Langkah-langkah

### 1. Menjalankan Server Backend
Pastikan server backend sudah berjalan dengan perintah:
```bash
pnpm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Endpoint API untuk Menambah Kategori
Gunakan endpoint berikut untuk menambahkan kategori baru:
```
POST http://localhost:3000/api/v1/categories
```

### 3. Format Data Kategori
Data yang dikirim harus dalam format JSON dengan struktur berikut:
```json
{
  "slug": "kopi-arabika",
  "name": "Kopi Arabika"
}
```

### 4. Contoh Penggunaan dengan curl
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "kopi-luwak",
    "name": "Kopi Luwak"
  }'
```

### 5. Contoh Response Sukses
Jika berhasil, API akan mengembalikan response seperti berikut:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "kopi-luwak",
    "name": "Kopi Luwak"
  }
}
```

### 6. Contoh Response Error
Jika terjadi kesalahan, API akan mengembalikan response seperti:
```json
{
  "success": false,
  "message": "Error creating category",
  "error": "Detail error"
}
```

## Field-field yang Tersedia
| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| slug | Ya | Slug unik untuk kategori |
| name | Ya | Nama kategori |

## Testing dengan Postman
1. Buka Postman
2. Buat request baru dengan method POST
3. Masukkan URL: `http://localhost:3000/api/v1/categories`
4. Pada tab Body, pilih "raw" dan "JSON"
5. Masukkan data kategori dalam format JSON
6. Klik "Send"

## Troubleshooting
1. Jika mendapat error "Slug already exists":
   - Gunakan slug yang berbeda
   
2. Jika server tidak merespon:
   - Pastikan server sudah berjalan dengan perintah `pnpm run dev`
   - Periksa apakah port 3000 tidak digunakan oleh aplikasi lain

## Melihat Daftar Kategori
Untuk melihat daftar kategori yang sudah ada:
```
GET http://localhost:3000/api/v1/categories
```

## Melihat Detail Kategori
Untuk melihat detail kategori berdasarkan ID:
```
GET http://localhost:3000/api/v1/categories/{category_id}
```

## Melihat Kategori berdasarkan Slug
Untuk melihat detail kategori berdasarkan slug:
```
GET http://localhost:3000/api/v1/categories/slug/{category_slug}
```