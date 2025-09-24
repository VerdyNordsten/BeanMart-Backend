# Admin Management Scripts

Script sederhana untuk mengelola admin user di Beanmart API.

## Penggunaan

### 1. Membuat Admin Baru
```bash
# Menggunakan npm script
npm run admin:create admin@beanmart.com password123

# Atau langsung dengan node
node src/scripts/create-admin.js --create admin@beanmart.com password123
```

### 2. Melihat Daftar Admin
```bash
# Menggunakan npm script
npm run admin:list

# Atau langsung dengan node
node src/scripts/create-admin.js --list
```

### 3. Update Password Admin
```bash
# Menggunakan npm script
npm run admin:update admin@beanmart.com newpassword123

# Atau langsung dengan node
node src/scripts/create-admin.js --update admin@beanmart.com newpassword123
```

### 4. Bantuan
```bash
node src/scripts/create-admin.js --help
```

## Contoh Penggunaan

```bash
# Buat admin pertama
npm run admin:create admin@beanmart.com admin123

# Lihat daftar admin
npm run admin:list

# Update password admin
npm run admin:update admin@beanmart.com newpassword456
```

## Catatan

- Password minimal 8 karakter
- Email harus format yang valid
- Admin yang dibuat otomatis aktif (is_active = true)
- Script akan otomatis terhubung ke database menggunakan environment variables

