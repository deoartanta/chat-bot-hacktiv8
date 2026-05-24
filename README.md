# 🍳 Chatbot Kuliner AI - Resep Nusantara

Chatbot kuliner yang membantu pengguna menemukan resep Nusantara, memberikan panduan memasak, tips substitusi bahan, dan interaksi chatbot sederhana dengan nuansa Chef AI.

---

## 🚀 Fitur Utama

- 🥘 Rekomendasi resep masakan Indonesia
- 📋 Langkah memasak yang jelas dan terstruktur
- 🔪 Tips teknik memasak dan cara penyajian
- 🌶️ Takaran bahan & bumbu
- 🔄 Alternatif bahan pengganti ketika stok terbatas
- 💬 Interaksi chatbot AI responsif
- 📦 Data resep tersimpan dalam file JSON lokal

---

## 🧰 Teknologi yang Digunakan

- Node.js / v24.15.0
- Express.js
- HTML, CSS, JavaScript (Vanilla)
- JSON untuk data resep
- Google GenAI (`@google/genai`) untuk fitur chatbot
- Multer untuk upload file jika diperlukan

---

## 🚀 Quick Start

1. Clone repository atau unduh sumber kode ini.
2. Masuk ke direktori project:

```bash
cd g:/project/Hacktiv8/chat-bot-hacktiv8
```

3. Install dependency:

```bash
npm install
```

4. Salin file environment:

```bash
cp .env.example .env
```

5. Isi nilai environment di `.env`:

```env
GEMINI_API_KEY=<<YOUR_GEMINI_API_KEY>>
CHEF_NAME=<<CHEF_NAME>>
GEMINI_MODEL=gemini-3.5-flash
```

6. Jalankan server:

```bash
npm run dev
```

> Jika `npm run dev` tidak berjalan karena `nodemon` tidak terpasang, gunakan:
>
> ```bash
> npx nodemon
> ```
>
> atau langsung:
>
> ```bash
> node index.js
> ```

7. Buka aplikasi di browser:

```text
http://localhost:3000/resep_nusantara_chatbot.html
```

---

## 📁 Struktur Project

- `index.js` - Entry point server Express
- `package.json` - Daftar dependensi dan script npm
- `.env.example` - Contoh environment variables
- `public/` - Frontend HTML, CSS, dan JavaScript
  - `resep_nusantara_chatbot.html` - Halaman aplikasi utama
  - `resep_nusantara_chatbot.js` - Logika UI dan pemanggilan API
  - `resep_nusantara_chatbot.css` - Styling halaman
- `Dummy/json/recipes.json` - Data resep yang diambil oleh frontend
- `handler/` - Logika API backend untuk chatbot dan data resep
- `helper/` - Utilitas pendukung

---

## 🌐 Endpoint Penting

- `GET /api/config` - Mengambil konfigurasi chef yang digunakan frontend
- `GET /api/recipes` - Mengambil data resep dari backend
- `POST /api/chat` - Endpoint chat AI
- `POST /api/generate-from-file` - Mengirim file untuk diproses oleh AI

---

## 📌 Catatan

- Data resep tersimpan di file `Dummy/json/recipes.json` dan dibaca oleh frontend.
- Pastikan `GEMINI_API_KEY` sudah diisi agar fitur AI dapat bekerja.
- Jika Anda menggunakan server lokal, jalankan `npm run dev` dan akses halaman HTML di browser.

---

## 🧩 Pengembangan Selanjutnya

- Menambahkan fitur kategori resep dinamis lebih lengkap
- Menyimpan riwayat chat pengguna
- Menambahkan autentikasi atau admin panel untuk mengelola resep
- Menambahkan caching data resep agar lebih cepat

---
