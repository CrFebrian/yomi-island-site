# Yomi Island: situs produk

Situs statis satu halaman (HTML, CSS, JS biasa, tanpa build). Sumber isi dan desain: `design.md`.

## Berkas
- `index.html`, `privasi.html`, `style.css`, `app.js`
- `assets/neko/` (GIF dan PNG maskot), `assets/favicon.png`, `assets/og.png`
- `downloads/Yomi-Island-setup.exe` (WAJIB Anda taruh sendiri, lihat bagian Installer)
- `.nojekyll` (agar GitHub Pages tidak memproses ulang berkas)

## Mencoba di komputer
Jalankan server lokal dari folder ini, lalu buka http://localhost:8000
    python -m http.server 8000

## Installer (tombol Unduh)
Semua tombol Unduh mengunduh langsung `downloads/Yomi-Island-setup.exe` dari situs ini, tanpa membuka halaman GitHub.
1. Ambil `…-setup.exe` dari rilis Anda, ganti namanya menjadi `Yomi-Island-setup.exe`.
2. Taruh di folder `downloads/`, lalu commit dan push bersama situs.
3. Saat rilis baru: timpa berkas itu, lalu ubah "0.1.1" di `index.html` (hero dan bagian Unduh). Ukuran installer terbaca otomatis dari berkas.
Tanpa berkas itu, tombol Unduh menghasilkan 404.

## Sebelum publish: sesuaikan 1 hal
Di `index.html`, ubah `og:image` ke alamat situs yang sebenarnya:
    https://<username>.github.io/<nama-repo>/assets/og.png

## Deploy ke GitHub Pages (gratis, repo harus publik)
1. Buat repo publik baru di GitHub, lalu dari folder ini:
       git init
       git add .
       git commit -m "Situs Yomi Island"
       git branch -M main
       git remote add origin https://github.com/<username>/<nama-repo>.git
       git push -u origin main
2. Di GitHub: Settings > Pages > Source: "Deploy from a branch" > Branch `main`, folder `/ (root)` > Save.
3. Tunggu 1-2 menit. Situs hidup di https://<username>.github.io/<nama-repo>/

Semua path aset memakai path relatif, jadi aman di alamat bersubfolder.

## Catatan
- Font Zen Maru Gothic dimuat dari Google Fonts. Untuk nol permintaan pihak ketiga, unduh woff2-nya, taruh di `assets/fonts/`, dan ganti `<link>` dengan `@font-face` (lalu hapus fonts.googleapis.com dan fonts.gstatic.com dari meta CSP).
- Kode situs hanya meminta ke situs sendiri (membaca ukuran installer). Tidak ada panggilan ke GitHub API.
