# Tutorial: Menambahkan Produk ke Sistem Beanmart

## Deskripsi
Tutorial ini menjelaskan cara menambahkan produk baru ke sistem Beanmart menggunakan API endpoint yang tersedia.

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

### 2. Endpoint API untuk Menambah Produk
Gunakan endpoint berikut untuk menambahkan produk baru:
```
POST http://localhost:3000/api/v1/products
```

### 3. Format Data Produk
Data yang dikirim harus dalam format JSON dengan struktur berikut:
```json
{
  "slug": "kopi-arabika",
  "name": "Kopi Arabika",
  "short_description": "Kopi arabika berkualitas tinggi",
  "long_description": "Deskripsi panjang tentang kopi arabika...",
  "source_url": "https://example.com/sumber-kopi",
  "base_price": 125000,
  "base_compare_at_price": 150000,
  "currency": "IDR",
  "is_active": true,
  "sku": "KA-001",
  "weight_gram": 1000
}
```

### 4. Contoh Penggunaan dengan curl
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "kopi-luwak-asli",
    "name": "Kopi Luwak Asli",
    "short_description": "Kopi luwak pilihan dari Sumatera",
    "base_price": 500000,
    "currency": "IDR",
    "is_active": true,
    "weight_gram": 500
  }'
```

### 5. Contoh Response Sukses
Jika berhasil, API akan mengembalikan response seperti berikut:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "kopi-luwak-asli",
    "name": "Kopi Luwak Asli",
    "short_description": "Kopi luwak pilihan dari Sumatera",
    "base_price": 500000,
    "currency": "IDR",
    "is_active": true,
    "weight_gram": 500,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 6. Contoh Response Error
Jika terjadi kesalahan, API akan mengembalikan response seperti:
```json
{
  "success": false,
  "message": "Error creating product",
  "error": "Detail error"
}
```

## Field-field yang Tersedia
| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| slug | Ya | Slug unik untuk produk |
| name | Ya | Nama produk |
| short_description | Tidak | Deskripsi singkat |
| long_description | Tidak | Deskripsi panjang |
| source_url | Tidak | URL sumber produk |
| base_price | Tidak | Harga dasar produk |
| base_compare_at_price | Tidak | Harga sebelum diskon |
| currency | Ya | Mata uang (default: IDR) |
| is_active | Ya | Status aktif produk |
| sku | Tidak | SKU produk |
| weight_gram | Tidak | Berat dalam gram |

## Testing dengan Postman
1. Buka Postman
2. Buat request baru dengan method POST
3. Masukkan URL: `http://localhost:3000/api/v1/products`
4. Pada tab Body, pilih "raw" dan "JSON"
5. Masukkan data produk dalam format JSON
6. Klik "Send"

## Troubleshooting
1. Jika mendapat error "Slug already exists":
   - Gunakan slug yang berbeda
   
2. Jika server tidak merespon:
   - Pastikan server sudah berjalan dengan perintah `pnpm run dev`
   - Periksa apakah port 3000 tidak digunakan oleh aplikasi lain

## Melihat Daftar Produk
Untuk melihat daftar produk yang sudah ada:
```
GET http://localhost:3000/api/v1/products
```

## Melihat Produk Aktif Saja
Untuk melihat hanya produk yang aktif:
```
GET http://localhost:3000/api/v1/products/active
```

## Melihat Detail Produk
Untuk melihat detail produk berdasarkan ID:
```
GET http://localhost:3000/api/v1/products/{product_id}
```

## Melihat Produk berdasarkan Slug
Untuk melihat detail produk berdasarkan slug:
```
GET http://localhost:3000/api/v1/products/slug/{product_slug}
```