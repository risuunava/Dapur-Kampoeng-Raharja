# PRD.md — Dapur Kampoeng Raharja

**Product Requirements Document**
**Versi:** 1.0
**Status:** Draft
**Terakhir diperbarui:** 21 Juli 2026

---

## 1. Overview

### 1.1 Latar Belakang

Dapur Kampoeng Raharja membutuhkan sistem digital terintegrasi untuk mengelola operasional harian: menampilkan menu ke pelanggan, mencatat transaksi kasir, dan memberi laporan ke owner tanpa perlu owner belajar dashboard baru.

### 1.2 Problem Statement

* Menu masih dikelola manual, pelanggan tidak tahu ketersediaan menu hari ini.
* Kasir butuh sistem yang tetap jalan meski koneksi internet warung tidak stabil.
* Owner butuh laporan transparan tanpa harus buka aplikasi/dashboard tambahan.
* Transaksi tidak boleh hilang atau dobel-catat akibat gangguan jaringan.

### 1.3 Goals

* Sistem kasir yang cepat, stabil, dan tahan offline.
* Website menu yang ringan dan real-time cukup (tidak perlu instant).
* Laporan otomatis masuk ke Google Sheets yang sudah familiar bagi owner.
* Arsitektur yang scalable untuk fitur lanjutan (QR order, pre-order, QRIS).

### 1.4 Non-Goals (di luar scope saat ini)

* Sistem pembayaran online terintegrasi (QRIS) — masuk Future Expansion.
* Multi-cabang / multi-tenant.
* Dashboard analytics kompleks — baru masuk Phase 3.

---

## 2. Target Users & Roles

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Customer** | Pelanggan yang cek menu | Lihat menu, tanpa login |
| **Kasir** | Staff yang mencatat transaksi | Input transaksi, update status menu |
| **Admin/Owner** | Pemilik/pengelola | CRUD menu, lihat semua transaksi, laporan Sheets |

---

## 3. System Architecture

### 3.1 Prinsip Utama

1. **Database = single source of truth** untuk seluruh sistem operasional, di-hosting via **Supabase** (managed PostgreSQL).
2. **Google Sheets = reporting layer** (append-only, tidak mengontrol sistem).
3. **Server adalah otoritas untuk data yang dibagikan lintas device** — termasuk penomoran invoice dan status ketersediaan menu final. Client tidak pernah memutuskan hal ini sendiri.
4. **Offline-first di sisi Kasir App** — transaksi harus tetap bisa dibuat tanpa internet dan tersinkron otomatis saat online kembali.
5. **Tidak ada infrastruktur lokal untuk database** — Supabase menyediakan Postgres terkelola, auth (opsional, bisa dipertimbangkan menggantikan login sederhana di fase lanjut), dan REST/Realtime API bawaan, sehingga tidak perlu Docker maupun instalasi Postgres native di laptop development.

### 3.2 Komponen

* **Website (Customer)** — Next.js, read-only terhadap data menu.
* **Kasir App (Android)** — Next.js + Capacitor, offline-first, create transaksi & update menu.
* **API (Backend)** — Next.js route/Express, single source of truth.
* **Sheets Service** — integrasi append-only ke Google Sheets untuk laporan.
* **Database (Supabase)** — PostgreSQL terkelola (managed), penyimpanan utama seluruh entitas, diakses oleh `services/api` menggunakan Supabase client atau koneksi Postgres langsung.

### 3.3 High-Level Flow

**Menu Flow:**
Kasir/Admin → API → Database → Website menampilkan menu

**Transaksi Flow:**
Kasir App → Local Storage (offline queue) → API → Database → Google Sheets

---

## 4. Functional Requirements

### 4.1 Website (Customer)

| ID | Requirement | Prioritas |
|---|---|---|
| WEB-01 | Menampilkan menu hari ini, besok, dan pilih tanggal tertentu | Must |
| WEB-02 | Menampilkan status menu: Tersedia / Habis | Must |
| WEB-03 | Menampilkan kategori menu | Must |
| WEB-04 | Highlight menu rekomendasi | Should |
| WEB-05 | Update status ketersediaan menu via polling ringan (30–60 detik) atau revalidate-on-focus | Must |
| WEB-06 | Tanpa login, mobile-first, fast loading | Must |
| WEB-07 | Progressive Web App (PWA) | Could |

**Catatan desain:** Website tidak butuh realtime instan (websocket) — polling/refetch ringan cukup untuk use case warung makan, dan lebih hemat kompleksitas.

---

### 4.2 Kasir App (Android)

| ID | Requirement | Prioritas |
|---|---|---|
| KSR-01 | Pilih menu & input transaksi | Must |
| KSR-02 | Hitung total otomatis | Must |
| KSR-03 | Generate invoice untuk pelanggan | Must |
| KSR-04 | Simpan transaksi ke local storage saat offline | Must |
| KSR-05 | Update status menu (Tersedia/Habis) | Must |
| KSR-06 | Login kasir (PIN 6 digit + username) | Must |
| KSR-07 | Auto-logout setelah idle X jam | Should |
| KSR-08 | Tampilkan status sinkronisasi transaksi (pending/syncing/synced/failed) | Must |
| KSR-09 | Manual retry button untuk transaksi gagal | Should |

**Catatan desain — Invoice Number:**
Karena penomoran invoice final digenerate di server (lihat 3.1), Kasir App menampilkan **UUID sementara / label "Menunggu sinkronisasi"** pada struk saat transaksi masih offline. Invoice resmi (`DKR-YYYYMMDD-XXX`) baru tampil setelah status `synced_db`. Ini adalah trade-off sadar: keamanan penomoran (tanpa collision) diprioritaskan di atas kecepatan tampil nomor instan.

---

### 4.3 Offline & Sync System (CRITICAL)

| ID | Requirement | Prioritas |
|---|---|---|
| SYNC-01 | Transaksi disimpan di local storage (IndexedDB/SQLite) sebelum dikirim ke server | Must |
| SYNC-02 | Transaksi memiliki status: `pending` → `syncing` → `synced_db` → `synced_sheets`, atau `failed` | Must |
| SYNC-03 | Retry otomatis setiap X detik untuk transaksi berstatus `pending`/`failed` | Must |
| SYNC-04 | Status `synced_db` dianggap sah secara bisnis, tidak bergantung status `synced_sheets` | Must |
| SYNC-05 | UUID v4 digenerate di client sebagai primary key & idempotency key | Must |
| SYNC-06 | API endpoint transaksi bersifat idempotent — retry dengan UUID sama tidak boleh insert dobel | Must |
| SYNC-07 | Invoice number final digenerate server-side saat transaksi masuk database (counter per-hari) | Must |
| SYNC-08 | Tidak ada transaksi yang hilang meski app force-close saat offline | Must |

---

### 4.4 Menu Management

| ID | Requirement | Prioritas |
|---|---|---|
| MNU-01 | CRUD menu oleh Admin/Kasir | Must |
| MNU-02 | Menu memiliki periode aktif (`start_date`, `end_date`) | Must |
| MNU-03 | Status menu: Tersedia/Habis, bisa diubah kasir real-time saat online | Must |
| MNU-04 | Kategori menu | Must |

---

### 4.5 Google Sheets Integration

| ID | Requirement | Prioritas |
|---|---|---|
| SHT-01 | Append-only, tidak pernah edit data existing | Must |
| SHT-02 | Data yang dikirim: waktu, invoice, menu, qty, harga, total, kasir | Must |
| SHT-03 | Kegagalan Sheets API tidak boleh memblok status transaksi di DB (lihat SYNC-04) | Must |
| SHT-04 | Retry terpisah untuk sync ke Sheets, independen dari retry sync ke DB | Should |

---

### 4.6 Security

| ID | Requirement | Prioritas |
|---|---|---|
| SEC-01 | Kasir login: PIN 6 digit + username | Must |
| SEC-02 | Admin login terpisah dengan akses lebih luas | Must |
| SEC-03 | API menggunakan token, dengan scope berbeda untuk Kasir App vs internal service (Sheets sync) | Must |
| SEC-04 | Setiap transaksi menyimpan `device_id` untuk traceability | Should |
| SEC-05 | Session auto-expire setelah idle dalam durasi tertentu | Should |

---

## 5. Data Model (Minimum)

### Menu
```
id, name, price, category, start_date, end_date, status
```

### Transaksi
```
id (UUID), invoice (nullable hingga synced), items (JSON),
total, created_at, kasir_id, device_id, sync_status
```
`sync_status` ∈ { pending, syncing, synced_db, synced_sheets, failed }

### User
```
id, name, role (admin/kasir), pin_hash, username
```

---

## 6. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | Website first load < 2 detik di koneksi 3G/4G standar |
| Reliability | Zero transaction loss; idempotent API wajib |
| Offline Support | Kasir App berfungsi penuh untuk create transaksi tanpa internet |
| Scalability | Struktur monorepo mendukung penambahan service tanpa refactor besar |
| Maintainability | Shared types & utils lewat `packages/` untuk konsistensi web & kasir app |

---

## 7. Project Structure (Monorepo)

```
dapur-kampoeng/
│
├── apps/
│   ├── web/              # Next.js (customer website)
│   ├── kasir/            # Next.js + Capacitor (android app)
│
├── services/
│   ├── api/              # Backend API
│   ├── sheets/           # Google Sheets integration service
│
├── packages/
│   ├── ui/
│   ├── utils/
│   ├── types/
│
├── database/
│   ├── schema.sql
│   ├── migrations/
│
├── .env
├── package.json
```

---

## 8. Development Roadmap

### Phase 1a — MVP Online-Only
* Menu CRUD
* Website menampilkan menu
* Kasir input transaksi (online-only, langsung ke DB)
* Belum ada offline queue, belum ada Sheets integration

### Phase 1b — Reporting Layer
* Integrasi Google Sheets (append-only)

### Phase 2 — Offline & Reliability
* Local storage (IndexedDB/SQLite) di Kasir App
* Transaction queue system lengkap
* Retry mechanism otomatis + manual
* Idempotent API
* Server-side invoice numbering

### Phase 3 — Owner Tools
* Dashboard owner
* Analytics
* Best seller report

---

## 9. Future Expansion (Out of Scope Saat Ini)

* QR order (scan meja)
* Pre-order
* Notifikasi stok
* Integrasi QRIS

---

## 10. Open Questions

Hal-hal berikut perlu keputusan final sebelum/selama Phase 1b–2:

1. Apakah kasir butuh cetak struk fisik saat transaksi masih `pending` (offline), atau tunggu sampai `synced_db`?
2. Berapa durasi idle sebelum auto-logout kasir (SEC-05)?
3. Berapa interval retry sync yang wajar (detik) tanpa membebani baterai/data Android?
4. Apakah 1 akun kasir boleh login di lebih dari 1 device secara bersamaan?

---

## 11. Success Metrics

* 0 transaksi hilang dalam simulasi offline selama X hari operasional.
* Website load time < 2 detik.
* Laporan Sheets ter-update maksimal dalam Y menit setelah transaksi `synced_db` (saat online normal).
* Kasir bisa menyelesaikan 1 transaksi dalam < 30 detik (UX kecepatan input). 