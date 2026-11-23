# WFH Attendance

Aplikasi fullstack untuk pencatatan kehadiran karyawan yang bekerja dari rumah (WFH), dibangun dengan arsitektur microservices.

Karyawan masuk ke aplikasi dan mencatat kehadiran harian dengan foto sebagai bukti kerja. HR mengelola data karyawan dan memantau semua kehadiran yang sudah dicatat (hanya bisa dilihat).

- **Backend:** NestJS, dibagi menjadi satu API gateway dan tiga microservice yang berkomunikasi lewat TCP, dengan MySQL sebagai database.
- **Frontend:** React (Vite, TypeScript, Tailwind). Teks antarmuka menggunakan Bahasa Indonesia.

## Fitur
Fitur utama:

- Login dengan email dan kata sandi, dengan akses berbeda untuk karyawan dan HR
- Karyawan mencatat kehadiran harian dengan foto sebagai bukti WFH; tanggal dan jam ditentukan oleh server
- Setiap karyawan hanya bisa mencatat kehadiran satu kali per hari
- Karyawan bisa melihat riwayat kehadirannya sendiri, dengan filter rentang tanggal
- HR bisa melihat daftar karyawan, dengan pencarian, filter (departemen, peran, status), dan pagination
- HR bisa menambah karyawan baru; kode karyawan dibuat otomatis
- HR bisa mengubah data karyawan, termasuk jabatan, departemen, peran, dan kata sandi
- HR bisa menonaktifkan dan mengaktifkan kembali akun karyawan; riwayat kehadiran tetap tersimpan
- HR bisa memantau semua kehadiran karyawan (hanya lihat), dengan filter nama atau kode, departemen, dan tanggal, serta pratinjau foto

Fitur tambahan:

- Pencatatan jam pulang, lengkap dengan durasi kerja
- Logout dan login otomatis berlaku di semua tab browser yang terbuka

## Instalasi

### Kebutuhan

- **Node.js 22.22 atau lebih baru.** Periksa dengan `node -v`.
- **MySQL 8.0.13 atau lebih baru** yang sedang berjalan, dan akun MySQL yang bisa membuat database (biasanya `root`). Dikembangkan dengan MySQL 8.4.

Perintah di bawah dijalankan dari folder root proyek, kecuali disebutkan lain.

### 1. Siapkan backend dan database

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Buka `backend/.env`, lalu isi `DB_USER` dan `DB_PASS` dengan akun MySQL Anda. Setelah itu jalankan:

```bash
npm run db:setup
```

Perintah ini membuat database `wfh_attendance`, tabel-tabelnya, serta 5 departemen dan 6 akun demo. Untuk mengosongkan data dan mulai dari awal, jalankan `npm run db:reset`.

### 2. Jalankan backend

Masih di folder `backend`:

```bash
npm run dev:all
```

Tunggu sampai log menampilkan `api-gateway running on http://localhost:3000/api`. Untuk memastikan semua service berjalan, buka `http://localhost:3000/api/health`.

### 3. Jalankan frontend

Di terminal kedua:

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

Buka **http://localhost:5173** lalu masuk dengan salah satu akun demo di bawah.

## Akun demo

Semua akun memakai kata sandi **`Password123!`**.

| Email | Peran | Keterangan |
|---|---|---|
| `hr.admin@example.com` | HR | Siti Rahmawati, HR Manager. Bisa membuka semua halaman. |
| `budi@example.com` | Karyawan | Budi Santoso, Software Engineer, IT |
| `ayu@example.com` | Karyawan | Ayu Lestari, Data Analyst, IT |
| `rizky@example.com` | Karyawan | Rizky Pratama, Finance |
| `dewi@example.com` | Karyawan | Dewi Anggraini, Marketing |
| `andi@example.com` | Karyawan | **Nonaktif.** Login ditolak dengan pesan "Akun Anda sudah dinonaktifkan". |

Setiap karyawan hanya bisa mencatat kehadiran sekali per hari. Untuk mencoba lagi di hari yang sama, gunakan akun lain.

## API

Base URL: `http://localhost:3000/api`

Semua endpoint kecuali `POST /auth/login` dan `GET /health` membutuhkan header `Authorization: Bearer <accessToken>`. Token didapat dari respons login.

| Method | Path | Akses | Fungsi |
|---|---|---|---|
| GET | `/health` | Publik | Status gateway dan ketiga service |
| POST | `/auth/login` | Publik | Masuk, mengembalikan token |
| GET | `/auth/me` | Sudah masuk | Profil pengguna saat ini |
| GET | `/departments` | Sudah masuk | Semua departemen |
| POST | `/attendances` | Sudah masuk | Catat jam masuk dengan foto |
| POST | `/attendances/clock-out` | Sudah masuk | Catat jam pulang hari ini |
| GET | `/attendances/me/today` | Sudah masuk | Status kehadiran hari ini |
| GET | `/attendances/me` | Sudah masuk | Riwayat kehadiran sendiri |
| GET | `/attendances` | HR | Semua data kehadiran |
| GET | `/employees` | HR | Daftar karyawan |
| GET | `/employees/:id` | HR | Detail satu karyawan |
| POST | `/employees` | HR | Tambah karyawan |
| PATCH | `/employees/:id` | HR | Ubah data karyawan |
| DELETE | `/employees/:id` | HR | Nonaktifkan karyawan |
