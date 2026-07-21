# DESIGN.md — Dapur Kampoeng Raharja

**UI/UX Design Guidelines**
**Versi:** 1.0
**Terakhir diperbarui:** 21 Juli 2026
**Referensi:** PRD.md, PLAN.md

---

## 1. Design Direction

### 1.1 Titik Berangkat

Ini warung makan kampung — bukan restoran fine-dining, bukan startup food-tech generik. Rasa yang ingin dimunculkan: **hangat, jujur, cepat dipahami**, seperti papan menu warung yang ditulis tangan tapi dirapikan secara digital. Dua produk punya kebutuhan berbeda:

- **Website Customer** → dilihat sekilas sebelum makan, kadang sambil buru-buru atau di tempat duduk warung. Harus langsung jelas: *apa yang ada hari ini, dan masih ada atau tidak.*
- **Kasir App** → dipegang staf berkali-kali sehari, kadang tangan basah/kotor, kadang buru-buru saat warung ramai. Harus **cepat disentuh, minim kesalahan input, jelas status sinkronisasinya**.

Kedua produk memakai satu design system yang sama supaya terasa satu keluarga, tapi tata letak Kasir App dioptimalkan untuk kecepatan operasional, bukan estetika galeri.

### 1.2 Signature Element

**"Papan status menu"** — alih-alih badge generik "Available/Sold Out" ala e-commerce, status menu ditampilkan seperti penanda fisik warung: potongan diagonal/coretan pada kartu menu yang habis (meniru cara warung biasa mencoret menu di papan tulis), dan garis bawah aksen warna kunyit pada menu yang direkomendasikan hari ini. Elemen ini konsisten dipakai di Website maupun Kasir App sebagai penanda visual utama status ketersediaan — bahasa visual yang sama di kedua produk.

### 1.3 Rasionalisasi Menghindari Default AI

Dihindari secara sadar: krem hangat + serif tinggi-kontras + aksen terracotta (`#D97757`-like), tema gelap dengan aksen neon tunggal, dan layout broadsheet hairline-rules. Sebagai gantinya dipilih palet **hijau daun pisang tua + kunyit/mustard + putih tulang**, terinspirasi warna warung tradisional Indonesia (daun pisang sebagai alas makan, kunyit sebagai bumbu dasar) — spesifik ke subjeknya, bukan template netral.

---

## 2. Design Tokens

### 2.1 Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-bg` | `#FBF8F1` | Background utama (putih tulang, bukan krem AI-default) |
| `--color-surface` | `#FFFFFF` | Kartu, panel |
| `--color-ink` | `#1F2A20` | Teks utama (hijau-hitam, bukan hitam pekat) |
| `--color-forest` | `#2F4A34` | Warna brand utama — hijau daun pisang tua |
| `--color-forest-dark` | `#1C2E1F` | Header, elemen kontras tinggi |
| `--color-turmeric` | `#D9A441` | Aksen utama — kunyit, dipakai untuk highlight & CTA |
| `--color-turmeric-deep` | `#B8822B` | Hover/active state dari aksen kunyit |
| `--color-chili` | `#B33A2E` | Status "Habis", error, peringatan (merah cabai, bukan merah generik) |
| `--color-line` | `#E4DCC8` | Border, divider (krem pudar, bukan abu netral) |
| `--color-muted` | `#6B7566` | Teks sekunder |

Palet ini sengaja **tidak** memakai terracotta/clay accent, dan tidak memakai dark-mode-neon — kontras diambil dari hijau tua vs kunyit, pasangan warna yang secara budaya dikenali dari warung Indonesia (daun pisang & bumbu) tanpa jadi ilustratif/kartunis.

### 2.2 Tipografi

| Role | Font | Alasan |
|---|---|---|
| Display (judul, nama menu besar) | **Fraunces** (variable, optical size besar) | Serif dengan karakter sedikit "ditulis", hangat tapi tetap modern — bukan serif tinggi-kontras ala editorial |
| Body & UI | **Plus Jakarta Sans** | Sudah dipakai konsisten di Morphanimal (project lain Risu) — geometris, sangat legible di layar kecil, cocok untuk UI padat seperti Kasir App |
| Angka & harga | **Plus Jakarta Sans** dengan `font-variant-numeric: tabular-nums` | Angka harga & qty harus rata kolom, penting di Kasir App saat kalkulasi cepat |

Skala tipe (rem, base 16px):

```
--text-xs:   0.75rem   (label, caption)
--text-sm:   0.875rem  (body sekunder, meta)
--text-base: 1rem      (body utama)
--text-lg:   1.25rem   (nama menu di list)
--text-xl:   1.75rem   (harga besar di Kasir, subjudul)
--text-2xl:  2.25rem   (judul halaman)
--text-3xl:  3rem      (hero website)
```

### 2.3 Layout & Spacing

- Grid spacing basis 4px (`4, 8, 12, 16, 24, 32, 48, 64`).
- Radius: `--radius-sm: 8px` (input, badge), `--radius-md: 16px` (kartu menu), `--radius-lg: 24px` (modal, sheet).
- Shadow minim — warung itu jujur bukan mengambang: `--shadow-card: 0 1px 3px rgba(31,42,32,0.08)`. Hindari drop shadow tebal/glow.

### 2.4 Motion

- Transisi standar `180ms ease-out` untuk hover/tap feedback.
- Satu momen orkestrasi yang disengaja: saat status menu berubah jadi "Habis", coretan diagonal muncul dengan animasi garis tergambar (`stroke-dashoffset`, ~300ms) — bukan fade biasa, supaya terasa seperti benar-benar "dicoret".
- Selebihnya motion minimal: tidak ada parallax, tidak ada efek dekoratif berlebihan (khususnya di Kasir App — animasi berlebih memperlambat alur kerja kasir).
- Menghormati `prefers-reduced-motion`: coretan langsung muncul tanpa animasi kalau setting ini aktif.

---

## 3. Website Customer — UX & UI

### 3.1 Prinsip UX

1. **Zero-friction**: tanpa login, tanpa onboarding, buka langsung lihat menu.
2. **Jawab pertanyaan dalam 3 detik pertama**: "Hari ini jual apa, dan apa yang masih ada?"
3. **Mobile-first murni** — asumsikan 90%+ traffic dari HP, kemungkinan dari warung sendiri (QR di meja, sesuai Future Expansion) atau dicek dari rumah.
4. **Tidak butuh scroll berlebihan** untuk info penting (menu tersedia hari ini harus terlihat tanpa banyak scroll).

### 3.2 Information Architecture

```
/                     → Menu hari ini (default landing)
/menu?date=YYYY-MM-DD → Menu tanggal tertentu
                          (query param, bukan halaman terpisah,
                           supaya share-link mudah)
```

Tidak ada navigasi kompleks — cukup 1 halaman dengan date-switcher di atas. Menghindari IA berlapis yang tidak perlu untuk kasus penggunaan sesederhana ini.

### 3.3 Wireframe — Halaman Menu (Mobile, viewport utama)

```
┌─────────────────────────────────┐
│  🍃 Dapur Kampoeng Raharja       │  ← header, forest-dark bg
│     Menu hari ini                │
├─────────────────────────────────┤
│  [ Kemarin ] [● Hari ini] [Besok]│  ← date switcher, pill toggle
│           [ Pilih tanggal ▾ ]    │
├─────────────────────────────────┤
│  ⭐ Direkomendasikan              │  ← section hanya muncul jika ada
│  ┌─────────────┐ ┌─────────────┐│
│  │ [foto]      │ │ [foto]      ││
│  │ Ayam Bakar  │ │ Sayur Asem  ││
│  │ Rp 18.000   │ │ Rp 8.000    ││
│  │ ▂▂ kunyit   │ │ ▂▂ kunyit   ││  ← underline aksen kunyit
│  └─────────────┘ └─────────────┘│
├─────────────────────────────────┤
│  Semua Menu          [Kategori▾]│
│  ┌─────────────────────────────┐│
│  │ [foto] Nasi Goreng   Rp 12rb ││
│  │        Tersedia              ││
│  ├─────────────────────────────┤│
│  │ [foto] Rendang       Rp 20rb ││
│  │        ╲╲ Habis ╲╲           ││  ← coretan diagonal signature
│  ├─────────────────────────────┤│
│  │ [foto] Es Teh Manis  Rp 5rb  ││
│  │        Tersedia              ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### 3.4 Komponen Kunci

**Date Switcher** — pill toggle horizontal (Kemarin/Hari ini/Besok) + dropdown "Pilih tanggal" untuk tanggal lain. Default selalu "Hari ini" ter-highlight dengan `--color-turmeric`. Ini penuhi WEB-01 tanpa butuh calendar picker berat di awal.

**Kartu Menu**:
- Foto (rasio 4:3, rounded `--radius-md`), fallback ilustrasi sederhana kalau foto belum ada — jangan biarkan kotak abu-abu kosong.
- Nama menu (Fraunces, `--text-lg`).
- Harga (Plus Jakarta Sans, tabular nums, bold).
- Status: teks "Tersedia" (hijau muted) atau coretan diagonal signature + label "Habis" (chili red) yang menutup sebagian kartu — kartu tetap terlihat (bukan disembunyikan) supaya customer tahu itu menu reguler yang kebetulan habis hari ini, bukan tidak pernah ada.

**Highlight/Rekomendasi**: section terpisah di atas, muncul hanya kalau admin menandai menu tertentu — hindari section kosong yang terasa seperti template kosong (WEB-04).

**Kategori filter**: dropdown simple, bukan tab-bar penuh (supaya tidak makan tempat vertikal di mobile).

**Empty/Error states** (sesuai prinsip "treat failure as direction, not mood"):
- Belum ada menu hari ini → *"Menu hari ini belum diunggah. Coba cek lagi nanti, atau lihat menu kemarin."* + tombol ke tanggal kemarin.
- Gagal memuat (network error) → *"Menu belum bisa dimuat. Periksa koneksi, lalu coba lagi."* + tombol "Coba lagi", bukan pesan teknis generic.

### 3.5 Update Real-Time (WEB-05)

Indikator kecil di header: titik hijau kecil + teks "Diperbarui X menit lalu", update otomatis lewat polling 30–60 detik atau revalidate-on-focus. Ini memberi kepercayaan ke customer bahwa data bukan statis, tanpa perlu websocket.

### 3.6 Accessibility & Responsif

- Kontras teks minimal AA (`--color-ink` di atas `--color-bg` = rasio tinggi, dicek manual saat implementasi).
- Status "Habis" tidak boleh **hanya** mengandalkan warna merah — selalu disertai teks label + coretan pattern, untuk pengguna buta warna.
- Target tap minimal 44×44px untuk date switcher & kategori dropdown.
- Layout scalable dari 320px (HP kecil) sampai desktop (grid 2 kolom → 3–4 kolom di layar lebar), meski desktop bukan prioritas utama.

---

## 4. Kasir App — UX & UI

### 4.1 Prinsip UX (Berbeda dari Website)

Kasir App **bukan** tentang keindahan — tentang **kecepatan, kejelasan status, dan minim salah pencet** saat warung ramai. Tiga prinsip:

1. **Thumb-zone first**: elemen yang paling sering disentuh (tambah item, konfirmasi bayar) ada di area bawah layar, gampang dijangkau ibu jari satu tangan.
2. **Status selalu terlihat**: kasir tidak boleh bingung apakah transaksi tadi sudah tersimpan atau belum — terutama krusial karena sistem offline-first.
3. **Recovery jelas**: kalau ada transaksi gagal sync, itu harus terlihat mencolok tapi tidak mengganggu alur kerja transaksi berikutnya.

### 4.2 User Flow Utama — Input Transaksi

```
[Login PIN] → [List Menu] → [Tap menu → masuk keranjang]
     → [Review keranjang & total] → [Konfirmasi bayar]
     → [Transaksi tersimpan lokal, status: Menunggu]
     → (background) sync ke server
     → [Status berubah: Tersinkron, invoice muncul]
```

Poin penting: **kasir tidak pernah nunggu proses sync untuk lanjut ke transaksi berikutnya.** Begitu "Konfirmasi bayar" ditekan dan tersimpan lokal, kasir bisa langsung mulai transaksi baru — sync jalan di background. Ini paling penting untuk KSR-04 dan prinsip offline-first.

### 4.3 Wireframe — Layar Input Transaksi (Kasir)

```
┌─────────────────────────────────┐
│ ☰  Kasir · Budi        🟢 Online │  ← status koneksi selalu terlihat
├─────────────────────────────────┤
│ [Cari menu...          🔍]       │
│ [Semua][Makanan][Minuman][Snack] │  ← chip kategori, horizontal scroll
├─────────────────────────────────┤
│ ┌───────┐┌───────┐┌───────┐     │
│ │Nasi   ││Ayam   ││Es Teh │     │
│ │Goreng ││Bakar  ││Manis  │     │  ← grid tap-to-add, besar & jelas
│ │12.000 ││18.000 ││5.000  │     │
│ └───────┘└───────┘└───────┘     │
│ ┌───────┐┌───────┐┌───────┐     │
│ │Rendang││Sayur  ││ ...   │     │
│ │╲Habis╲││8.000  ││       │     │  ← menu habis: dim + tidak bisa tap
│ └───────┘└───────┘└───────┘     │
├─────────────────────────────────┤
│ 🛒 3 item          Rp 35.000     │  ← sticky bottom bar, thumb zone
│         [ Lihat Keranjang → ]    │
└─────────────────────────────────┘
```

### 4.4 Wireframe — Keranjang & Konfirmasi

```
┌─────────────────────────────────┐
│ ← Keranjang                      │
├─────────────────────────────────┤
│ Nasi Goreng      [–] 2 [+]  24rb │
│ Es Teh Manis     [–] 1 [+]   5rb │
│ Ayam Bakar       [–] 1 [+]  18rb │
├─────────────────────────────────┤
│ Total                    Rp 47rb │  ← besar, tabular nums
├─────────────────────────────────┤
│      [ Konfirmasi & Bayar ]      │  ← tombol besar, full-width,
│                                   │     warna turmeric, area tap besar
└─────────────────────────────────┘
```

Setelah tombol ditekan → transisi cepat (bukan modal berat) ke struk ringkas dengan status sync, lalu otomatis kembali ke list menu setelah 2 detik atau tap "Transaksi Baru" — meminimalkan langkah antar-transaksi karena ini dipakai puluhan kali sehari.

### 4.5 Status Sinkronisasi (KSR-08, KSR-09) — Komponen Kritis

Bukan sekadar teks kecil — status sync mendapat **tempat permanen** di UI karena ini inti dari kepercayaan sistem offline-first:

```
┌─────────────────────────────────┐
│  Struk · DKR-•••••• (sementara)  │
│  Nasi Goreng x2, Es Teh x1...    │
│  Total: Rp 47.000                │
│                                   │
│  🟡 Menunggu sinkronisasi        │  ← pending
│  🔵 Menyinkronkan...              │  ← syncing
│  🟢 Tersinkron · DKR-20260721-014│  ← synced_db, invoice asli muncul
│  🔴 Gagal sync   [Coba Lagi]     │  ← failed + manual retry (KSR-09)
└─────────────────────────────────┘
```

Warna status **tidak boleh ambigu**: kuning=menunggu, biru=proses, hijau=selesai, merah=gagal — pola warna ini konsisten dipakai di seluruh app (juga di riwayat transaksi), sehingga kasir belajar sekali dan berlaku di mana saja.

Badge status koneksi global di header (🟢 Online / 🟠 Offline) membantu kasir memahami *kenapa* transaksi menumpuk di status "Menunggu" — bukan dianggap sistem rusak.

### 4.6 Riwayat Transaksi (untuk cek transaksi yang gagal/pending)

List sederhana, terbaru di atas, dengan filter status (Semua / Menunggu / Gagal) supaya kasir gampang cek apakah ada transaksi yang butuh manual retry tanpa harus scroll semua riwayat hari itu.

### 4.7 Update Menu oleh Kasir (KSR-05)

Dari list menu, tap-and-hold atau tombol kecil "..." pada kartu menu → toggle cepat Tersedia/Habis. Ini harus **1–2 tap saja**, karena biasanya dilakukan tergesa-gesa saat stok benar-benar habis di tengah jam sibuk — bukan lewat form terpisah.

### 4.8 Login & Session (KSR-06, KSR-07, SEC-01)

- Layar login: input username + PIN pad numerik besar (bukan keyboard penuh) — lebih cepat dan lebih tahan banting untuk device warung yang mungkin dipegang bergantian.
- Indikator idle timeout: peringatan halus muncul beberapa menit sebelum auto-logout ("Sesi akan berakhir dalam 2 menit — ketuk layar untuk tetap masuk"), supaya kasir tidak tiba-tiba ke-logout di tengah transaksi.

### 4.9 Accessibility & Ergonomi Device

- Target tap minimal **48×48px** (lebih besar dari website) karena Kasir App dipakai cepat & kadang dalam kondisi tangan tidak ideal (basah/berminyak, tergesa).
- Kontras tinggi untuk teks harga & total — ini angka yang paling penting untuk dibaca akurat.
- Font angka selalu tabular nums supaya kolom qty/harga rata dan mudah di-scan cepat.
- Feedback taktil/visual instan (`180ms`) di setiap tap tombol menu — kasir harus yakin tap-nya kebaca meski layar ramai ditekan cepat berkali-kali.

---

## 5. Komponen Bersama (`packages/ui`)

Supaya konsisten dan efisien sesuai struktur monorepo di PRD.md, komponen berikut dibangun sekali di `packages/ui` dan dipakai di kedua app:

| Komponen | Dipakai di | Catatan |
|---|---|---|
| `MenuCard` | Website, Kasir | Prop `variant="display"` (website, dengan foto besar) vs `variant="compact"` (kasir, grid padat) |
| `StatusBadge` | Website, Kasir | Warna & label status menu/sync konsisten |
| `PriceText` | Website, Kasir | Format Rupiah + tabular nums terpusat |
| `Button` | Keduanya | Varian `primary` (turmeric), `secondary` (forest outline), `danger` (chili) |
| `EmptyState` | Keduanya | Ikon + pesan + CTA, dipakai untuk semua kondisi kosong/error |

---

## 6. Ringkasan Prioritas UX per Produk

| Website Customer | Kasir App |
|---|---|
| Kejelasan info dalam 3 detik | Kecepatan input, minim tap |
| Tanpa friksi (no login) | Status sync selalu terlihat |
| Nyaman dibaca sambil santai | Nyaman dipakai tergesa-gesa |
| Estetika hangat & mengundang | Fungsional, thumb-zone, recovery jelas |

Kedua produk berbagi bahasa visual yang sama (warna, tipografi, signature coretan status) supaya terasa satu sistem — tapi *pace* interaksinya sengaja dibedakan sesuai konteks pemakaian masing-masing.
