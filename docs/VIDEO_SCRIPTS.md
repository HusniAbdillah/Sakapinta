# Video Scripts & Recording Guidelines (COMPFEST 18 AIC)

Dokumen ini berisi panduan dan naskah (*script*) untuk merekam **Video Proof of Work (Maks 3-7 Menit)** dan **Video Promosi Inovasi (Maks 5 Menit)** sesuai ketentuan resmi penyisihan COMPFEST 18 AI Innovation Challenge.

---

## 1. Video Proof of Work (Unlisted YouTube, Maksimal 3 Menit)

> **Format Penamaan Video**: `COMPFEST 18 AIC: PROOF OF WORK - [Nama Tim] - Sakapinta`  
> **Visibility**: Unlisted  
> **Tampilan**: Double Screen (Terminal Docker + Aplikasi Browser) + Timestamp.

### Timeline & Naskah Narasi (3 Menit)

| Timestamp | Tampilan Layar | Narasi / Voice Over |
| :--- | :--- | :--- |
| **00:00 - 00:30** | **Tampilan Layar Ganda**: Sisi Kiri: Terminal Power Shell running `docker-compose up`. Sisi Kanan: Browser `http://localhost:3000`. | *"Halo juri COMPFEST 18 AIC. Ini adalah video Proof of Work untuk proyek Sakapinta dari tim kami. Aplikasi kami dapat di-deploy secara lokal menggunakan satu perintah `docker-compose up`. Di terminal kiri terlihat kontainer backend FastAPI di port 8000 dan frontend Next.js di port 3000 berjalan secara sehat."* |
| **00:30 - 01:15** | **Halaman Utama Sakapinta**: Menunjukkan tombol "Muat Data Sampel UMKM Indonesia". Klik tombol tersebut. | *"Saat pengguna membuka Sakapinta, pengguna dapat langsung menekan tombol Muat Data Sampel Ritel Indonesia. Dalam kurang dari 1 detik, backend FastAPI menjalankan inferensi statis menggunakan model Multi-Quantile LightGBM yang telah di-load tanpa proses retraining di runtime, sesuai batasan MVP."* |
| **01:15 - 02:00** | **Executive KPIs & Action Table**: Menunjukkan KPI Modal, Kerugian Omset, Tabel Prioritas SKU, dan Chart Recharts. | *"Hasil inferensi langsung diolah oleh Hybrid Decision Layer. Sistem menampilkan total modal yang dibutuhkan, estimasi omset yang hilang jika stok habis, dan tabel prioritas pesanan. Di grafik Recharts, pengguna dapat melihat prediksi 14 hari ke depan beserta pita ketidakpastian P10-P90."* |
| **02:00 - 02:30** | **What-If Budget Simulator & Export CSV**: Mengubah slider anggaran di simulator dan mengklik tombol "Unduh Laporan Restock (.CSV)". | *"Sakapinta dilengkapi dengan What-If Budget Simulator untuk menyesuaikan rekomendasi pesanan saat modal terbatas. Pengguna juga dapat menekan tombol Unduh Laporan Restock CSV untuk mengunduh daftar pesanan yang siap diserahkan ke supplier."* |
| **02:30 - 03:00** | **Unggah File CSV Kustom**: Menunjukkan drag-and-drop file CSV baru ke Upload Zone. | *"Terakhir, kami menguji pengunggahan file CSV kustom. Sistem memvalidasi kolom dan mengembalikan keputusan stok secara sinkron. Seluruh fitur MVP berjalan 100% lancar. Terima kasih."* |

---

## 2. Video Promosi Karya Inovasi (Public YouTube, Maksimal 5 Menit)

> **Format Penamaan Video**: `COMPFEST 18 AIC: [Nama Tim] - Sakapinta`  
> **Visibility**: Public  
> **Target**: Juri, Investor, Pemilik UMKM Ritel.

### Outline Struktur Video (5 Menit)

1. **The Problem (00:00 - 01:00)**:
   - Tunjukkan krisis stok UMKM Indonesia: Warung/toko kelontong sering kehabisan barang saat Lebaran/Gajian atau kehabisan modal karena barang tidak laku.
   - Peramalan deret waktu biasa hanya memberikan angka mentah tanpa rekomendasi tindakan.
2. **The Innovation (01:00 - 02:30)**:
   - Kenalkan **Sakapinta**: Tiang Penyangga Keputusan Stok UMKM Indonesia.
   - Jelaskan penggabungan **Dataset Baseline Ritel + Injeksi Kalender Indonesia** (Ramadan, Lebaran, Harbolnas, Payday).
   - Jelaskan keunggulan **Multi-Quantile LightGBM AI Core** & **Hybrid Decision Layer**.
3. **Product Demo & Business Value (02:30 - 04:00)**:
   - Demonstrasi UI Sakapinta: Kemudahan 1-click test, Actionable KPIs, Priority Table, What-If Simulator, dan Ekspor CSV Supplier.
4. **Governance & Responsible AI (04:00 - 04:30)**:
   - Jelaskan bahwa AI Sakapinta transparan, menggunakan batas matematis kuantil tanpa halusinasi LLM.
5. **Call to Action & Impact (04:30 - 05:00)**:
   - Dampak ekonomi terhadap tulang punggung perekonomian Indonesia (*Backbone Economy*).
