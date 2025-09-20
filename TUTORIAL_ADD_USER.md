# Tutorial: Menambahkan User ke Sistem Beanmart

## Deskripsi
Tutorial ini menjelaskan cara menambahkan user baru ke sistem Beanmart menggunakan API endpoint yang tersedia.

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

### 2. Endpoint API untuk Menambah User
Gunakan endpoint berikut untuk menambahkan user baru:
```
POST http://localhost:3000/api/v1/users
```

### 3. Format Data User
Data yang dikirim harus dalam format JSON dengan struktur berikut:
```json
{
  "email": "user@example.com",
  "phone": "+6281234567890",
  "full_name": "Nama Lengkap User",
  "password_hash": "hashed_password" // opsional
}
```

### 4. Contoh Penggunaan dengan curl
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi.santoso@example.com",
    "phone": "+6281234567890",
    "full_name": "Budi Santoso"
  }'
```

### 5. Contoh Response Sukses
Jika berhasil, API akan mengembalikan response seperti berikut:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "budi.santoso@example.com",
    "phone": "+6281234567890",
    "full_name": "Budi Santoso",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 6. Contoh Response Error
Jika terjadi kesalahan, API akan mengembalikan response seperti:
```json
{
  "success": false,
  "message": "Error creating user",
  "error": "Detail error"
}
```

## Validasi Data
- Email harus unik (tidak boleh sama dengan user lain)
- Email harus dalam format yang valid
- Phone dan full_name bersifat opsional

## Testing dengan Postman
1. Buka Postman
2. Buat request baru dengan method POST
3. Masukkan URL: `http://localhost:3000/api/v1/users`
4. Pada tab Body, pilih "raw" dan "JSON"
5. Masukkan data user dalam format JSON
6. Klik "Send"

## Troubleshooting
1. Jika mendapat error "Email already exists":
   - Gunakan email yang berbeda
   
2. Jika mendapat error "Invalid email format":
   - Pastikan format email sesuai standar (contoh: user@domain.com)
   
3. Jika server tidak merespon:
   - Pastikan server sudah berjalan dengan perintah `pnpm run dev`
   - Periksa apakah port 3000 tidak digunakan oleh aplikasi lain

## Melihat Daftar User
Untuk melihat daftar user yang sudah ada:
```
GET http://localhost:3000/api/v1/users
```

## Melihat Detail User
Untuk melihat detail user berdasarkan ID:
```
GET http://localhost:3000/api/v1/users/{user_id}
```