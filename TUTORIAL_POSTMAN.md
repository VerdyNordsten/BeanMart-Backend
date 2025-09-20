# Tutorial: Menggunakan Postman untuk Mengakses API Beanmart

## Deskripsi
Tutorial ini menjelaskan cara menggunakan Postman untuk mengakses dan menguji API Beanmart.

## Prasyarat
1. Postman sudah terinstal
2. Server backend Beanmart sudah berjalan
3. Koneksi internet

## Langkah-langkah

### 1. Menjalankan Server Backend
Sebelum menggunakan Postman, pastikan server backend sudah berjalan:
```bash
pnpm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Membuka Postman
1. Buka aplikasi Postman
2. Klik "Create a request" atau buka tab baru

### 3. Mengakses Health Check Endpoint
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/health`
3. Klik "Send"
4. Seharusnya menerima response:
   ```json
   {
     "status": "OK",
     "message": "Beanmart API is running"
   }
   ```

### 4. Mengakses API v1 Root
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1`
3. Klik "Send"
4. Seharusnya menerima response:
   ```json
   {
     "status": "OK",
     "version": "v1",
     "message": "Beanmart API v1 is running"
   }
   ```

### 5. Mengelola Users

#### Mendapatkan Semua User
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/users`
3. Klik "Send"

#### Membuat User Baru
1. Di Postman, set method ke `POST`
2. Masukkan URL: `http://localhost:3000/api/v1/users`
3. Klik tab "Body"
4. Pilih "raw" dan "JSON"
5. Masukkan data:
   ```json
   {
     "email": "user@example.com",
     "full_name": "User Contoh",
     "phone": "+628123456789"
   }
   ```
6. Klik "Send"

#### Mendapatkan User Berdasarkan ID
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/users/{user_id}`
3. Ganti `{user_id}` dengan ID user yang sebenarnya
4. Klik "Send"

#### Mengupdate User
1. Di Postman, set method ke `PUT`
2. Masukkan URL: `http://localhost:3000/api/v1/users/{user_id}`
3. Ganti `{user_id}` dengan ID user yang sebenarnya
4. Klik tab "Body"
5. Pilih "raw" dan "JSON"
6. Masukkan data yang ingin diupdate:
   ```json
   {
     "full_name": "User Contoh Update",
     "phone": "+628987654321"
   }
   ```
7. Klik "Send"

#### Menghapus User
1. Di Postman, set method ke `DELETE`
2. Masukkan URL: `http://localhost:3000/api/v1/users/{user_id}`
3. Ganti `{user_id}` dengan ID user yang sebenarnya
4. Klik "Send"

### 6. Mengelola Products

#### Mendapatkan Semua Product
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/products`
3. Klik "Send"

#### Mendapatkan Product Aktif
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/products/active`
3. Klik "Send"

#### Membuat Product Baru
1. Di Postman, set method ke `POST`
2. Masukkan URL: `http://localhost:3000/api/v1/products`
3. Klik tab "Body"
4. Pilih "raw" dan "JSON"
5. Masukkan data:
   ```json
   {
     "slug": "kopi-arabika",
     "name": "Kopi Arabika",
     "short_description": "Kopi arabika berkualitas tinggi",
     "base_price": 125000,
     "currency": "IDR",
     "is_active": true,
     "weight_gram": 1000
   }
   ```
6. Klik "Send"

#### Mendapatkan Product Berdasarkan ID
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/products/{product_id}`
3. Ganti `{product_id}` dengan ID product yang sebenarnya
4. Klik "Send"

#### Mendapatkan Product Berdasarkan Slug
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/products/slug/{product_slug}`
3. Ganti `{product_slug}` dengan slug product yang sebenarnya
4. Klik "Send"

#### Mengupdate Product
1. Di Postman, set method ke `PUT`
2. Masukkan URL: `http://localhost:3000/api/v1/products/{product_id}`
3. Ganti `{product_id}` dengan ID product yang sebenarnya
4. Klik tab "Body"
5. Pilih "raw" dan "JSON"
6. Masukkan data yang ingin diupdate:
   ```json
   {
     "base_price": 130000,
     "short_description": "Kopi arabika premium berkualitas tinggi"
   }
   ```
7. Klik "Send"

#### Menghapus Product
1. Di Postman, set method ke `DELETE`
2. Masukkan URL: `http://localhost:3000/api/v1/products/{product_id}`
3. Ganti `{product_id}` dengan ID product yang sebenarnya
4. Klik "Send"

### 7. Mengelola Categories

#### Mendapatkan Semua Category
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/categories`
3. Klik "Send"

#### Membuat Category Baru
1. Di Postman, set method ke `POST`
2. Masukkan URL: `http://localhost:3000/api/v1/categories`
3. Klik tab "Body"
4. Pilih "raw" dan "JSON"
5. Masukkan data:
   ```json
   {
     "slug": "kopi",
     "name": "Kopi"
   }
   ```
6. Klik "Send"

#### Mendapatkan Category Berdasarkan ID
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/categories/{category_id}`
3. Ganti `{category_id}` dengan ID category yang sebenarnya
4. Klik "Send"

#### Mendapatkan Category Berdasarkan Slug
1. Di Postman, set method ke `GET`
2. Masukkan URL: `http://localhost:3000/api/v1/categories/slug/{category_slug}`
3. Ganti `{category_slug}` dengan slug category yang sebenarnya
4. Klik "Send"

#### Mengupdate Category
1. Di Postman, set method ke `PUT`
2. Masukkan URL: `http://localhost:3000/api/v1/categories/{category_id}`
3. Ganti `{category_id}` dengan ID category yang sebenarnya
4. Klik tab "Body"
5. Pilih "raw" dan "JSON"
6. Masukkan data yang ingin diupdate:
   ```json
   {
     "name": "Kopi Premium"
   }
   ```
7. Klik "Send"

#### Menghapus Category
1. Di Postman, set method ke `DELETE`
2. Masukkan URL: `http://localhost:3000/api/v1/categories/{category_id}`
3. Ganti `{category_id}` dengan ID category yang sebenarnya
4. Klik "Send"

### 8. Menggunakan Swagger Documentation
API juga memiliki dokumentasi Swagger yang dapat diakses melalui:
`http://localhost:3000/api-docs`

Dokumentasi ini menyediakan:
- Deskripsi lengkap semua endpoint
- Contoh request dan response
- Kemampuan untuk menguji endpoint langsung dari browser

## Tips dan Trik

### 1. Menyimpan Request
1. Setelah membuat request, klik "Save"
2. Beri nama request
3. Pilih atau buat collection
4. Request akan tersimpan untuk digunakan di masa depan

### 2. Menggunakan Environment Variables
1. Klik "Environment" di pojok kanan atas
2. Buat environment baru
3. Tambahkan variable seperti `base_url` dengan value `http://localhost:3000`
4. Gunakan dalam request dengan `{{base_url}}/api/v1/users`

### 3. Membuat Collection
1. Klik "Collections" di sidebar kiri
2. Klik "New Collection"
3. Beri nama collection (misal: "Beanmart API")
4. Tambahkan semua request terkait ke collection ini

### 4. Menggunakan Pre-request Scripts
Untuk request yang memerlukan authentication, bisa menggunakan pre-request scripts untuk menyiapkan token.

### 5. Menggunakan Tests
Gunakan tab "Tests" untuk menambahkan script pengujian otomatis, seperti memeriksa status code atau struktur response.