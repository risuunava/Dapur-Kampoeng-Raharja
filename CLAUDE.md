# CLAUDE.md

Dokumen ini adalah panduan kerja untuk AI agent (Claude Code atau sejenisnya) saat bekerja di repo **dapur-kampoeng**. Baca dokumen ini dulu sebelum melakukan perubahan apapun.

**Dokumen terkait yang wajib dirujuk sesuai konteks tugas:**
- `PRD.md` — requirement produk & prioritas fitur
- `PLAN.md` — urutan phase implementasi, langkah setup
- `DESIGN.md` — design system, token warna/tipografi, UX per produk

Jangan mengambil keputusan produk/desain baru tanpa merujuk ke tiga dokumen di atas. Kalau ada konflik antara instruksi user dan dokumen ini, tanyakan dulu daripada menebak.

---

## 1. Project Overview

Sistem operasional untuk warung "Dapur Kampoeng Raharja": website menu customer (read-only), kasir app Android offline-first (Next.js + Capacitor), backend API sebagai single source of truth, dan integrasi Google Sheets untuk laporan (append-only).

Struktur monorepo (pnpm workspace):

```
apps/web        → Next.js, website customer
apps/kasir       → Next.js + Capacitor, kasir app Android
services/api     → Backend API (Express + TypeScript)
services/sheets  → Integrasi Google Sheets
packages/ui      → Komponen UI bersama
packages/utils   → Helper functions bersama
packages/types   → TypeScript types bersama
database/        → schema.sql & migrations
```

---

## 2. Commands

Jalankan semua command dari root repo kecuali disebutkan lain.

```bash
# Install semua dependency (root & semua workspace)
pnpm install

# Development
pnpm --filter web dev        # Website customer, http://localhost:3000
pnpm --filter kasir dev      # Kasir app (browser), http://localhost:3000
pnpm --filter api dev        # Backend API, http://localhost:4000

# Build
pnpm --filter web build
pnpm --filter kasir build    # wajib sebelum cap sync
pnpm --filter api build

# Capacitor (dari dalam apps/kasir)
cd apps/kasir
npm run build && npx cap sync android
npx cap open android         # butuh Android Studio

# Lint & type-check (jalankan sebelum commit)
pnpm --filter <workspace> lint
pnpm --filter <workspace> type-check   # jika script tersedia

# Database (Supabase — tidak ada database lokal)
# Jalankan isi database/schema.sql lewat SQL Editor di dashboard Supabase project.
# Koneksi & kredensial ada di .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL) — lihat PLAN.md 0.8.
```

Kalau sebuah workspace belum punya script tertentu (`lint`, `test`, dst), cek `package.json` workspace itu dulu sebelum asumsi command generik.

---

## 3. Commit Convention

Repo ini pakai **Conventional Commits**. Format:

```
<type>(<scope>): <deskripsi singkat, present tense, lowercase>

<body opsional — jelaskan "kenapa", bukan cuma "apa">
```

**Type yang dipakai:**

| Type | Kapan dipakai |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `chore` | Maintenance, tidak mengubah kode fitur (dependency, config) |
| `docs` | Perubahan dokumentasi (`*.md`) saja |
| `style` | Format kode saja, tanpa ubah logika |
| `refactor` | Ubah struktur kode tanpa ubah behavior |
| `test` | Menambah/mengubah test |
| `perf` | Perbaikan performa |
| `build` | Perubahan build system/dependency |
| `ci` | Perubahan CI/CD config |
| `revert` | Membatalkan commit sebelumnya |

**Scope** = nama workspace atau area terdampak: `web`, `kasir`, `api`, `sheets`, `ui`, `types`, `db`, `prd`, `design`, dst.

**Contoh:**
```
feat(kasir): tambah offline queue dengan retry mechanism
fix(api): perbaiki race condition pada invoice numbering
chore(sheets): update dependency googleapis ke v144
docs(plan): tambah checklist phase 2
refactor(web): pisahkan lib/api.ts jadi per-resource
```

**Aturan tambahan:**
- Satu commit = satu perubahan logis. Jangan gabungkan `feat` dan `fix` yang tidak berkaitan dalam satu commit.
- Deskripsi singkat maksimal ~72 karakter, tanpa titik di akhir.
- Body dipakai kalau perubahan butuh konteks tambahan (misal alasan keputusan teknis) — terutama untuk perubahan yang menyentuh sync engine, invoice numbering, atau Sheets integration, karena area ini rawan bug halus.
- Kalau perubahan breaking (misal ubah struktur `sync_status`), tambahkan footer `BREAKING CHANGE: <penjelasan>`.
- **Jangan pernah commit file `.env` atau credentials Google Sheets JSON.** Pastikan `.gitignore` mencakup ini sebelum commit pertama kali menyentuh `services/sheets`.

---

## 4. Konvensi Kode

- **Bahasa kode & komentar teknis**: Inggris untuk nama variabel/fungsi (standar industri), tapi copy/UI text tetap Bahasa Indonesia sesuai `DESIGN.md`.
- **TypeScript strict** di semua workspace — hindari `any`, gunakan tipe dari `packages/types` untuk entitas bersama (`Menu`, `Transaksi`, `SyncStatus`, dst) alih-alih redefinisi lokal.
- **Styling**: Tailwind CSS, token warna & spacing mengikuti `DESIGN.md` section 2 (gunakan CSS variable, jangan hardcode hex baru tanpa alasan).
- **Struktur folder fitur**: ikuti pola `features/<nama-fitur>/` yang sudah ada di `apps/web` dan `apps/kasir` (lihat `PLAN.md` section 0.3–0.4), jangan taruh logic fitur langsung di `app/`.
- **API response**: konsisten pakai shape `{ data, error }` atau sesuaikan dengan yang sudah ada di `services/api` — jangan campur gaya response antar endpoint.

---

## 5. Aturan Kritis (Do's & Don'ts)

Area-area ini sudah melalui diskusi desain matang di PRD.md/PLAN.md — **jangan diubah tanpa alasan kuat dan tanpa mendiskusikan dulu**:

- ❌ **Jangan generate invoice number di client/Kasir App.** Invoice final selalu digenerate server-side lewat `invoice_counter` (lihat PLAN.md 2.4). Client hanya boleh pakai UUID sebagai id sementara.
- ❌ **Jangan buat endpoint transaksi baru tanpa idempotency check** berbasis UUID. Setiap `POST /transaksi` wajib cek id yang sudah ada dulu sebelum insert.
- ❌ **Jangan blocking response kasir demi menunggu Google Sheets API.** Sync ke Sheets selalu async dan terpisah dari status `synced_db` (lihat PLAN.md 1b.8).
- ❌ **Jangan commit credentials** (`GOOGLE_SHEETS_PRIVATE_KEY`, file JSON service account, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `.env` apapun).
- ❌ **Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke client** (`apps/web`, `apps/kasir`). Key ini hanya boleh dipakai di `services/api` karena bisa bypass Row Level Security.
- ❌ **Jangan menonaktifkan RLS** di tabel `transaksi`, `users`, `invoice_counter` tanpa mendiskusikan dulu (lihat PLAN.md 0.8.5).
- ✅ **Selalu update `sync_status` lewat state machine yang sudah didefinisikan**: `pending → syncing → synced_db → synced_sheets`, atau `failed`. Jangan tambah status baru tanpa update `packages/types`.
- ✅ **Ikuti design token di DESIGN.md** untuk warna/tipografi baru — jangan pakai warna di luar palet tanpa menambahkannya ke token system dulu.
- ✅ Saat menyentuh Phase 2 (offline/sync), selalu pertimbangkan skenario: device offline lama, dua device sync bersamaan, retry saat server down.

---

## 6. Alur Kerja yang Disarankan

1. Baca task, cek relevansinya ke `PRD.md` (requirement) dan `PLAN.md` (ada di phase mana).
2. Kalau task menyentuh UI, cek `DESIGN.md` untuk komponen/token yang relevan sebelum bikin baru.
3. Implementasi, jalankan lint/type-check sebelum commit.
4. Commit dengan format Conventional Commits di atas — satu commit per perubahan logis.
5. Kalau task mengubah keputusan arsitektur yang sudah ada (bukan cuma implementasi), catat perubahan itu dan beri tahu user — jangan diam-diam menyimpang dari PRD/PLAN.

---

## 7. Catatan Konteks Project

- Ini proyek pertama dengan integrasi Google Sheets — perhatikan detail auth (service account, `private_key` escaping) sesuai PLAN.md section 1b sebelum mengubah kode di `services/sheets`.
- Target device Kasir App: Android, kemungkinan device warung yang bukan flagship — jaga performa & bundle size, hindari dependency berat yang tidak perlu.
- Prioritas roadmap: Phase 0 → 1a → 1b → 2 → 3 (lihat PLAN.md). Jangan implementasi fitur Phase 2/3 sebelum Phase sebelumnya stabil, kecuali diminta eksplisit oleh user.