# PLAN.md — Dapur Kampoeng Raharja

**Implementation Plan**
**Versi:** 1.0
**Terakhir diperbarui:** 21 Juli 2026
**Referensi:** PRD.md

---

## Cara Pakai Dokumen Ini

Setiap phase punya langkah berurutan yang bisa langsung diikuti dari terminal. Checklist `[ ]` bisa dicentang manual seiring progress. Jangan loncat phase — terutama Phase 0 (setup) harus selesai dulu karena semua phase berikutnya bergantung pada struktur monorepo ini.

---

## Phase 0 — Project Setup & Monorepo Structure

Tujuan: menyiapkan skeleton monorepo sesuai struktur di PRD.md sebelum menulis fitur apapun.

### 0.1 Inisialisasi Monorepo

```bash
mkdir dapur-kampoeng
cd dapur-kampoeng
git init
npm init -y
```

Install tool monorepo. Rekomendasi: **pnpm workspace** (ringan, tidak perlu tool tambahan seperti Turborepo dulu di awal — bisa ditambah nanti kalau butuh caching build).

```bash
npm install -g pnpm
```

Buat `pnpm-workspace.yaml` di root:

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

Update `package.json` root:

```json
{
  "name": "dapur-kampoeng",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:kasir": "pnpm --filter kasir dev",
    "dev:api": "pnpm --filter api dev"
  }
}
```

- [ ] Root repo & pnpm workspace siap
- [ ] `.gitignore` dibuat (node_modules, .env, .next, dist, android/app/build)

---

### 0.2 Buat Struktur Folder Dasar

```bash
mkdir -p apps services packages database
mkdir -p packages/ui packages/utils packages/types
mkdir -p database/migrations
touch database/schema.sql
touch .env
```

- [ ] Struktur folder `apps/`, `services/`, `packages/`, `database/` sesuai PRD.md

---

### 0.3 Setup `apps/web` — Website Customer (Next.js)

```bash
cd apps
npx create-next-app@latest web
```

Saat prompt muncul, pilih:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes** (opsional, tapi rapi)
- App Router: **Yes**
- Import alias: default (`@/*`)

Setelah selesai:

```bash
cd web
mkdir -p lib features/menu
touch lib/api.ts
cd ../..
```

- [ ] `apps/web` berhasil dibuat dan bisa `pnpm --filter web dev`

---

### 0.4 Setup `apps/kasir` — Kasir App (Next.js + Capacitor)

Buat dulu sebagai Next.js app biasa, baru tambahkan Capacitor di atasnya.

```bash
cd apps
npx create-next-app@latest kasir
```

Pilihan sama seperti `web` (TypeScript, ESLint, Tailwind, App Router).

**Penting:** Capacitor butuh static export atau server yang bisa diakses dari WebView. Untuk app kasir yang punya banyak interaksi (offline storage, dsb), pendekatan paling stabil adalah **static export** (`output: 'export'`) di `next.config.js`, karena Capacitor pada dasarnya membungkus web app sebagai WebView native — server-side rendering penuh tidak relevan untuk app yang jalan offline.

Edit `apps/kasir/next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

module.exports = nextConfig;
```

Install Capacitor di dalam `apps/kasir`:

```bash
cd kasir
npm install @capacitor/core @capacitor/cli
npx cap init
```

Saat `cap init` ditanya:
- App name: `Kasir Dapur Kampoeng Raharja`
- App ID (reverse domain): misal `com.dapurkampoeng.kasir`
- Web dir: `out` (karena `output: 'export'` menghasilkan folder `out/`)

Tambahkan platform Android:

```bash
npm install @capacitor/android
npx cap add android
```

Build & sync pertama kali (harus build Next.js dulu sebelum sync karena Capacitor butuh folder `out/`):

```bash
npm run build
npx cap sync android
```

Buat `capacitor.config.ts` (biasanya sudah otomatis dibuat oleh `cap init`, cek isinya):

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dapurkampoeng.kasir',
  appName: 'Kasir Dapur Kampoeng Raharja',
  webDir: 'out',
};

export default config;
```

Setelah ini, buat sisa struktur folder kasir sesuai PRD.md:

```bash
mkdir -p lib features/transaksi features/menu
touch lib/api.ts lib/local-db.ts lib/sync.ts
cd ../..
```

- [ ] `apps/kasir` bisa `npm run build` tanpa error
- [ ] `npx cap sync android` berhasil
- [ ] Folder `android/` muncul di `apps/kasir`
- [ ] Bisa dibuka via `npx cap open android` (butuh Android Studio terpasang)

**Catatan:** development sehari-hari untuk UI kasir tetap pakai `next dev` biasa di browser (lebih cepat iterasi). Baru `build → sync → open android` saat mau test perilaku native (misal SQLite plugin, kamera, dsb).

---

### 0.5 Setup `services/api` — Backend API

```bash
mkdir -p services/api
cd services/api
npm init -y
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/express @types/node @types/cors
npx tsc --init
```

Buat struktur folder sesuai PRD.md:

```bash
mkdir -p routes controllers services middleware utils
touch routes/menu.ts routes/transaksi.ts
touch services/sheets.service.ts
```

Buat entry point `index.ts`:

```ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
```

Tambahkan script di `services/api/package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- [ ] `services/api` bisa `pnpm --filter api dev` dan `/health` merespons

---

### 0.6 Setup `services/sheets` — Sheets Integration Service

Buat foldernya dulu, isinya di-set up detail di Phase 0.8.

```bash
mkdir -p services/sheets
cd services/sheets
npm init -y
```

- [ ] Folder `services/sheets` siap (implementasi menyusul di 0.8)

---

### 0.7 Setup `packages/` — Shared Code

```bash
cd packages/types
npm init -y
mkdir src
touch src/index.ts index.ts
cd ../utils
npm init -y
mkdir src
touch src/index.ts
cd ../ui
npm init -y
mkdir src
touch src/index.tsx
```

Isi awal `packages/types/src/index.ts` — definisikan tipe inti dari Data Model di PRD.md:

```ts
export type SyncStatus = 'pending' | 'syncing' | 'synced_db' | 'synced_sheets' | 'failed';

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string;
  start_date: string;
  end_date: string;
  status: 'tersedia' | 'habis';
}

export interface TransaksiItem {
  menu_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Transaksi {
  id: string; // UUID
  invoice: string | null; // null sampai synced_db
  items: TransaksiItem[];
  total: number;
  created_at: string;
  kasir_id: string;
  device_id: string;
  sync_status: SyncStatus;
}
```

- [ ] `packages/types` berisi tipe inti yang bisa diimport `web`, `kasir`, dan `api`

---

### 0.8 Setup Database — Supabase

Database di-hosting di **Supabase** (managed PostgreSQL) — tidak install Postgres native maupun Docker di laptop. Development langsung terhubung ke instance Supabase (project gratis/free tier cukup untuk tahap awal).

**0.8.1 Buat Project Supabase**

1. Buka [supabase.com](https://supabase.com/), sign up/login (bisa pakai akun GitHub).
2. Klik **New Project**.
3. Isi:
   - **Name**: `dapur-kampoeng-raharja`
   - **Database Password**: generate password kuat, **simpan di password manager** — ini dipakai untuk koneksi langsung (bukan cuma API key).
   - **Region**: pilih yang paling dekat dengan target user, misal Singapore (paling dekat ke Indonesia).
4. Tunggu beberapa menit sampai project selesai provisioning.

- [x] Project Supabase aktif (buat di https://supabase.com, namai `dapur-kampoeng-raharja`)

**0.8.2 Ambil Kredensial**

Di dashboard project → **Project Settings → API**:
- `Project URL` (format `https://xxxxx.supabase.co`)
- `anon public key` — dipakai untuk akses dari client (kalau nanti Website/Kasir akses langsung ke Supabase) atau `service_role key` — dipakai khusus di backend (`services/api`), **jangan pernah expose ke client**, karena key ini bisa bypass Row Level Security.

Di **Project Settings → Database**:
- `Connection string` (URI) — dipakai kalau `services/api` konek langsung pakai driver Postgres biasa (misal `pg` atau ORM seperti Prisma/Drizzle) alih-alih Supabase client library.

- [x] Template `.env` sudah disiapkan dengan placeholder — isi sendiri dengan kredensial dari dashboard Supabase

**0.8.3 Isi `.env`**

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key, hanya dipakai di services/api, JANGAN expose ke client>
SUPABASE_ANON_KEY=<anon_key, aman dipakai di client kalau perlu>
DATABASE_URL=postgresql://postgres:<password>@db.xxxxx.supabase.co:5432/postgres
```

Pastikan `.env` sudah masuk `.gitignore` sebelum isi apapun.

- [x] `.env` sudah diisi kredensial nyata (bukan placeholder) dan tidak ter-track git

**0.8.4 Buat Schema Lewat SQL Editor Supabase**

Supabase punya **SQL Editor** bawaan di dashboard — schema bisa dijalankan langsung dari sana tanpa butuh koneksi database lokal.

Isi `database/schema.sql` (disimpan di repo sebagai source of truth, lalu dijalankan manual di SQL Editor Supabase untuk saat ini; migration tool otomatis bisa ditambahkan belakangan lewat Supabase CLI kalau tim bertambah):

```sql
CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'tersedia'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kasir'))
);

CREATE TABLE transaksi (
  id UUID PRIMARY KEY, -- dikirim dari client sebagai idempotency key
  invoice TEXT UNIQUE,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kasir_id UUID REFERENCES users(id),
  device_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

-- Counter harian untuk invoice number, dipakai server saat generate invoice
CREATE TABLE invoice_counter (
  date DATE PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);
```

Cara menjalankan: buka dashboard Supabase → **SQL Editor** → **New query** → paste isi `schema.sql` → **Run**.

- [x] Semua tabel berhasil dibuat (jalan `database/schema.sql` lewat SQL Editor Supabase)

**0.8.5 Row Level Security (RLS) — Penting untuk Supabase**

Supabase secara default mengekspos tabel lewat REST API otomatis (PostgREST). Kalau RLS tidak diaktifkan, tabel bisa diakses siapa saja yang punya `anon key` (yang tertanam di client-side kalau Website/Kasir akses langsung).

Untuk arsitektur project ini (di mana `services/api` adalah satu-satunya pintu masuk resmi ke database, sesuai prinsip "Server adalah otoritas" di PRD.md), rekomendasinya:

- [x] Aktifkan **RLS** di semua tabel (`Table Editor` → pilih tabel → toggle **Enable RLS**)
- [x] **Jangan buat policy publik** untuk `anon key` di tabel `transaksi`, `users`, `invoice_counter`

**0.8.6 Install Client Library di `services/api`**

```bash
cd services/api
npm install @supabase/supabase-js
```

Buat `services/api/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service_role, hanya dipakai di backend
);
```

- [x] `@supabase/supabase-js` terinstall + `lib/supabase.ts` sudah dibuat
- [x] Test koneksi: `supabase.from('menu').select('*')` return array kosong tanpa error

---

### 0.9 Verifikasi Phase 0 Selesai

- [x] `pnpm install` di root berhasil tanpa error untuk semua workspace
- [x] `apps/web` jalan di browser (`pnpm --filter web dev`)
- [x] `apps/kasir` jalan di browser (`pnpm --filter kasir dev`) dan bisa di-build untuk Capacitor
- [x] `services/api` merespons di `/health`
- [x] Struktur folder 100% cocok dengan diagram di PRD.md bagian 7

---

## Phase 1a — MVP Online-Only

Tujuan: menu tampil di website, kasir bisa input transaksi langsung ke database (belum offline, belum Sheets).

### 1a.1 Menu CRUD (API)
- [x] Endpoint `GET /menu` (dengan filter tanggal & status)
- [x] Endpoint `POST /menu`, `PUT /menu/:id`, `DELETE /menu/:id` (admin only, sementara tanpa auth ketat dulu — bisa hardcode admin token)

### 1a.2 Website Menampilkan Menu
- [x] `apps/web` fetch dari `GET /menu` via `lib/api.ts`
- [x] Tampilkan menu hari ini / besok / pilih tanggal (WEB-01)
- [x] Tampilkan status Tersedia/Habis (WEB-02)
- [x] Tampilkan kategori (WEB-03)

### 1a.3 Kasir Input Transaksi (Online-Only)
- [x] UI pilih menu & hitung total otomatis (KSR-01, KSR-02)
- [x] Endpoint `POST /transaksi` di API — insert langsung ke DB, generate invoice langsung (karena online-only, belum ada race condition offline)
- [x] Kasir App kirim transaksi langsung ke API (belum lewat local storage)
- [x] Generate invoice display sederhana (KSR-03)

### 1a.4 Login Sederhana
- [x] Endpoint `POST /auth/login` (username + PIN)
- [x] Simpan token di Kasir App

**Checkpoint Phase 1a:** ✅ sistem bisa dipakai di warung secara nyata selama koneksi internet stabil. Ini baseline sebelum menambah kompleksitas offline & Sheets.

---

## Phase 1b — Google Sheets Integration (Reporting Layer)

> Bagian ini ditulis lebih detail karena ini proyek pertamamu dengan Google Sheets API — setiap langkah termasuk hal-hal yang biasanya bikin stuck di awal (credentials, permission, format data).

### 1b.1 Buat Google Cloud Project & Aktifkan API

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru, misal nama `dapur-kampoeng-raharja`.
3. Di sidebar, buka **APIs & Services → Library**.
4. Cari **Google Sheets API**, klik **Enable**.

- [ ] Google Sheets API aktif di project

### 1b.2 Buat Service Account (Cara Terbaik untuk Backend-to-Sheets)

Kenapa Service Account, bukan OAuth biasa: karena `services/sheets` adalah proses backend tanpa interaksi user langsung — Service Account memungkinkan API mengakses Sheets tanpa perlu login manual tiap kali token expired.

1. Di Google Cloud Console, buka **APIs & Services → Credentials**.
2. Klik **Create Credentials → Service Account**.
3. Isi nama, misal `dapur-kampoeng-sheets-writer`.
4. Role: bisa dilewati (tidak perlu role IAM project, karena akses diatur lewat share Sheet, bukan lewat IAM).
5. Setelah service account dibuat, klik masuk ke dalamnya → tab **Keys** → **Add Key → Create new key → JSON**.
6. File JSON credentials otomatis terdownload — **ini rahasia, jangan pernah commit ke git**.

- [ ] Service account dibuat
- [ ] File JSON credentials didownload dan disimpan aman

### 1b.3 Share Google Sheet ke Service Account

1. Buat Google Sheet baru untuk laporan, misal `Laporan Transaksi - Dapur Kampoeng Raharja`.
2. Buka file JSON credentials, cari field `client_email` (formatnya seperti `dapur-kampoeng-sheets-writer@dapur-kampoeng-raharja.iam.gserviceaccount.com`).
3. Di Google Sheet, klik **Share**, tempel email tersebut, beri akses **Editor**.

**Ini langkah yang paling sering terlewat oleh pemula** — service account punya "akun" sendiri yang terpisah dari akun Google pribadi, dan tidak otomatis punya akses ke Sheet manapun sampai di-share manual seperti share ke orang lain.

- [ ] Sheet sudah di-share ke `client_email` service account dengan akses Editor

### 1b.4 Siapkan Struktur Sheet

Buat sheet/tab bernama `Transaksi` dengan header di baris 1, sesuai SHT-02:

```
waktu | invoice | menu | qty | harga | total | kasir
```

- [ ] Header kolom sudah sesuai urutan yang akan dikirim dari kode

### 1b.5 Setup Kredensial di Project

Simpan file JSON credentials **di luar git tracking**. Rekomendasi: taruh isinya sebagai environment variable, bukan file fisik di repo (lebih aman untuk deployment).

Di `.env` (root atau `services/sheets/.env`, sesuai kebutuhan):

```
GOOGLE_SHEETS_CLIENT_EMAIL=dapur-kampoeng-sheets-writer@dapur-kampoeng-raharja.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=<ID dari URL sheet>
```

`SPREADSHEET_ID` diambil dari URL sheet:
`https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`

Pastikan `.env` sudah masuk `.gitignore`.

- [ ] **MANUAL:** Isi `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID` di `.env` setelah setup Google Cloud

### 1b.6 Install Library & Tulis Kode Integrasi

Kode integrasi sudah ditulis di `services/sheets/src/`:
- `client.ts` — Auth JWT dengan Google Sheets API
- `appendTransaksi.ts` — Fungsi append per baris & batch
- `index.ts` — Re-export
- `test.ts` — Test manual

**Catatan penting soal `private_key`:** private key di file JSON mengandung karakter `\n` literal yang harus di-escape dengan benar saat disimpan sebagai environment variable single-line — itu kenapa ada `.replace(/\\n/g, '\n')` di atas. Ini salah satu sumber error paling umum (`error: invalid_grant` atau `DECODER routines::unsupported`) untuk pemula.

- [ ] **MANUAL:** Jalankan `pnpm --filter sheets test:append` setelah `.env` Sheets terisi untuk verifikasi

### 1b.7 Uji Coba Manual Sebelum Integrasi Penuh

File test sudah ada di `services/sheets/src/test.ts`. Jalankan:
```bash
pnpm --filter sheets test:append
```

- [ ] **MANUAL:** Jalankan test di atas setelah kredensial Sheets terisi untuk verifikasi auth flow

### 1b.8 Hubungkan ke Flow Transaksi (SHT-01, SHT-03, SHT-04)

- [x] Setelah transaksi berstatus `synced_db` di API, panggil `appendTransaksiToSheet` secara **async, tidak memblok response ke kasir** (lihat `services/api/routes/transaksi.ts` & `services/api/services/sheets.service.ts`)
- [x] Kalau `appendTransaksiToSheet` gagal (rate limit/down), catat error, set status transaksi tetap `synced_db` (bukan `failed`)
- [x] Update `sync_status` jadi `synced_sheets` hanya setelah append berhasil

**Kenapa dipisah dari response ke kasir:** kasir tidak boleh menunggu Google Sheets API (yang bisa lambat/rate-limited) untuk tahu transaksinya berhasil. DB adalah source of truth, Sheets menyusul.

### 1b.9 Rate Limit Awareness

Google Sheets API punya kuota (umumnya 60 write request/menit/user pada tier gratis, cek kuota project sendiri di Cloud Console). Kalau volume transaksi warung tinggi dan tiap transaksi langsung append satu-satu, ini biasanya masih jauh dari limit — tapi tetap:

- [ ] **NANTI:** Tambahkan retry dengan exponential backoff kalau dapat response `429` dari Sheets API
- [ ] **NANTI:** Batch beberapa transaksi sekaligus pakai `values.append` dengan multiple rows kalau volume mulai tinggi

Fungsi `appendBatchToSheet` sudah tersedia di `services/sheets/src/appendTransaksi.ts` — tinggal dipakai saat batching diimplementasi.

**Checkpoint Phase 1b:** ✅ kode integrasi sudah siap. Jalankan test manual setelah kredensial terisi.

---

## Phase 2 — Offline & Reliability System

Tujuan: Kasir App bisa bikin transaksi tanpa internet dan sync otomatis saat online, sesuai SYNC-01 s/d SYNC-08.

### 2.1 Local Storage di Kasir App
- [ ] Install SQLite plugin untuk Capacitor: `npm install @capacitor-community/sqlite` (atau IndexedDB via `idb` kalau ingin tetap web-only tanpa native plugin dulu)
- [ ] Buat skema local table `transaksi_local` yang mirror struktur DB (id UUID, items, total, sync_status, dst)
- [ ] Implementasi `lib/local-db.ts`: fungsi `saveTransaksiLocal`, `getPendingTransaksi`, `updateSyncStatus`

### 2.2 Transaction Queue & Sync Engine
- [ ] Implementasi `lib/sync.ts`: loop yang jalan tiap X detik, ambil transaksi `pending`/`failed`, kirim ke API
- [ ] Set status `syncing` saat mulai kirim, biar retry timer lain tidak kirim dobel
- [ ] Update status jadi `synced_db` kalau API balas sukses dengan invoice number
- [ ] Kalau gagal (network error), balik ke `pending`, hitung retry count untuk backoff

### 2.3 Idempotent API Endpoint
- [ ] `POST /transaksi` cek dulu apakah UUID sudah ada di DB (via `id` sebagai primary key)
- [ ] Kalau sudah ada → return response yang sama seperti transaksi sukses (bukan insert baru, bukan error)
- [ ] Kalau belum ada → insert baru, generate invoice server-side pakai `invoice_counter` (dengan row lock/transaction untuk hindari race condition antar transaksi yang masuk bersamaan)

### 2.4 Server-Side Invoice Generation
- [ ] Buat fungsi SQL/transaction: increment `invoice_counter` untuk tanggal hari ini, format jadi `DKR-YYYYMMDD-XXX`
- [ ] Pastikan operasi ini atomic (pakai `SELECT ... FOR UPDATE` di Postgres) supaya dua transaksi masuk bersamaan tidak dapat nomor sama

### 2.5 UI Status Sinkronisasi di Kasir App
- [ ] Tampilkan badge status per transaksi: Menunggu / Sinkron / Gagal (KSR-08)
- [ ] Tombol manual retry untuk transaksi `failed` (KSR-09)
- [ ] Struk tampilkan UUID/placeholder saat masih `pending`, ganti ke invoice resli setelah `synced_db`

**Checkpoint Phase 2:** matikan wifi warung di tengah simulasi transaksi, transaksi tetap tersimpan, otomatis sync begitu online kembali, tidak ada yang hilang atau dobel.

---

## Phase 3 — Owner Tools

- [ ] Dashboard sederhana: total transaksi hari ini, menu terlaris
- [ ] Analytics dasar (grafik penjualan per kategori/waktu)
- [ ] Best seller report

*(Detail teknis Phase 3 akan diperluas setelah Phase 1–2 stabil dan dipakai nyata di warung, supaya kebutuhan dashboard didasarkan pada data & feedback owner yang sesungguhnya.)*

---

## Ringkasan Urutan Kerja

```
Phase 0  → Setup monorepo, Next.js x2, Capacitor, API skeleton, DB schema
Phase 1a → Menu CRUD + Website + Kasir input online-only
Phase 1b → Google Sheets integration (append-only, async, non-blocking)
Phase 2  → Offline queue, retry, idempotency, server-side invoice numbering
Phase 3  → Dashboard & analytics owner
```

Setiap phase punya checkpoint yang bisa dites langsung di warung sebelum lanjut ke phase berikutnya — jangan lompat ke Phase 2 sebelum Phase 1a benar-benar stabil dipakai online-only dulu.