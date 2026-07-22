# Dapur Kampoeng Raharja

Sistem operasional digital untuk warung Dapur Kampoeng Raharja. Mencakup website menu customer (read-only), aplikasi kasir Android offline-first, backend API, dan integrasi Google Sheets untuk laporan.

---

## Struktur Monorepo

```
dapur-kampoeng/
├── apps/
│   ├── web/              # Website customer — Next.js
│   └── kasir/            # Kasir App — Next.js + Capacitor (Android)
├── services/
│   ├── api/              # Backend API — Express + TypeScript
│   └── sheets/           # Google Sheets integration service
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
├── database/
│   ├── schema.sql        # Database schema
│   └── migrations/       # SQL migrations
├── .env                  # Environment variables (not tracked in git)
├── pnpm-workspace.yaml
├── package.json
├── PLAN.md
├── PRD.md
└── DESIGN.md
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- **Supabase** account (free tier)
- **Google Cloud Console** account (untuk Sheets integration)
- **Android Studio** (untuk build Kasir App ke APK)

## Setup

### 1. Clone dan install dependencies

```bash
git clone <repo-url> dapur-kampoeng
cd dapur-kampoeng
pnpm install
```

### 2. Setup Database (Supabase)

1. Buat project di [Supabase](https://supabase.com)
2. Buka SQL Editor, paste isi `database/schema.sql`, jalankan
3. Buka SQL Editor, paste isi `database/migrations/001_atomic_invoice_counter.sql`, jalankan
4. Ambil kredensial dari Project Settings > API:
   - `Project URL`
   - `service_role key` (hanya untuk API server)
5. Isi di file `.env` (lihat template di bawah)

### 3. Setup Google Sheets (opsional — untuk laporan)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project, aktifkan Google Sheets API
3. Buat Service Account, download credentials JSON
4. Buat Google Sheet, share ke `client_email` service account dengan akses Editor
5. Buat sheet/tab bernama `Transaksi` dengan header: `waktu | invoice | menu | qty | harga | total | kasir`
6. Isi kredensial di `.env`

### 4. Konfigurasi Environment

Buat file `.env` di root:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_ANON_KEY=<anon_key>
DATABASE_URL=postgresql://postgres:<password>@db.xxxxx.supabase.co:5432/postgres

# API
PORT=4000
JWT_SECRET=<ganti-dengan-secret-kuat>

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=<service-account-email>
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet-id>
```

## Menjalankan Development

Jalankan di terminal terpisah:

```bash
# Backend API — http://localhost:4000
pnpm --filter api dev

# Website Customer — http://localhost:3000
pnpm --filter web dev

# Kasir App — http://localhost:3001
pnpm --filter kasir dev
```

Atau dari root:

```bash
pnpm run dev:api
pnpm run dev:web
pnpm run dev:kasir
```

## Build

```bash
pnpm --filter web build
pnpm --filter api build
pnpm --filter kasir build
```

### Build Kasir App untuk Android

```bash
cd apps/kasir
npm run build && npx cap sync android
npx cap open android
```

## Arsitektur

### Alur Data

**Menu Flow:**
```
Admin/Kasir (Kasir App) --> API --> Database --> Website menampilkan menu
```

**Transaksi Flow:**
```
Kasir (Kasir App) --> IndexedDB (local storage) --> API --> Database
                                                          --> Google Sheets (async)
```

### Prinsip Utama

1. **Database = single source of truth** — Supabase (PostgreSQL managed)
2. **Google Sheets = reporting layer** — append-only, tidak mengontrol sistem
3. **Server adalah otoritas** — invoice numbering, status menu, semua diputuskan server-side
4. **Offline-first** — transaksi disimpan di IndexedDB lokal, sync otomatis saat online
5. **Non-blocking Sheets** — kegagalan Sheets API tidak memblok response transaksi

## Fitur per Aplikasi

### Website Customer (`apps/web`)

- Menampilkan menu hari ini, kemarin, besok, dan pilih tanggal
- Filter kategori
- Status menu Tersedia / Habis dengan visual coretan
- Auto-refresh setiap 30 detik dan saat tab kembali aktif

### Kasir App (`apps/kasir`)

- Login dengan username + PIN 6 digit (keypad numerik)
- Pilih menu dan hitung total otomatis
- Generate struk dengan status sinkronisasi
- Offline-first: transaksi disimpan lokal, sync otomatis
- Halaman Riwayat dengan filter status sinkronisasi
- Manajemen menu (tambah/edit/hapus/toggle status) — untuk role admin
- Status koneksi online/offline di header

### Backend API (`services/api`)

- REST API dengan Express + TypeScript
- Auth dengan JWT (bcrypt + jsonwebtoken)
- Middleware role-based access control (admin / kasir)
- Invoice numbering server-side dengan `SELECT ... FOR UPDATE` (atomic)
- Idempotent transaksi endpoint (berbasis UUID)
- Async sync ke Google Sheets

### Sheets Service (`services/sheets`)

- Auth JWT dengan Google Sheets API (service account)
- Append transaksi ke Google Sheet (batch per transaksi)
- Retry exponential backoff saat rate limit (429)

## Database Schema

```sql
-- Menu
CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'tersedia'
);

-- Users (admin/kasir)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kasir'))
);

-- Transaksi
CREATE TABLE transaksi (
  id UUID PRIMARY KEY,
  invoice TEXT UNIQUE,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kasir_id UUID REFERENCES users(id),
  device_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

-- Counter invoice harian
CREATE TABLE invoice_counter (
  date DATE PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);
```

Status sinkronisasi: `pending` -> `syncing` -> `synced_db` -> `synced_sheets`, atau `failed`.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Mobile | Next.js + Capacitor 8 (Android) |
| Backend | Express, TypeScript |
| Database | Supabase (PostgreSQL managed) |
| Auth | JWT + bcryptjs |
| Reports | Google Sheets API, Service Account |
| Storage | IndexedDB (via `idb`) |
| Package | pnpm workspace |

## Testing

**Google Sheets integration:**
```bash
pnpm --filter sheets test:append
```

**Test offline scenario:**
1. Jalankan API dan kasir app
2. Matikan koneksi internet
3. Buat transaksi di kasir
4. Hidupkan koneksi kembali
5. Pastikan transaksi tersinkron otomatis dengan invoice number

## Commit Convention

Mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): deskripsi singkat

fix(api): perbaiki race condition pada invoice numbering
feat(kasir): tambah offline queue dengan retry mechanism
chore(deps): update dependency googleapis ke v144
```

Scope: `web`, `kasir`, `api`, `sheets`, `ui`, `types`, `db`, `docs`.

## License

Private — Dapur Kampoeng Raharja
