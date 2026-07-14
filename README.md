# ☁️ SkyCast — Aplikasi Cuaca Global Single Page Application (SPA)

![SkyCast Banner](assets/banner.jpeg)

SkyCast adalah aplikasi cuaca berbasis **Single Page Application (SPA)** yang dirancang untuk memberikan informasi cuaca secara **real-time**, kualitas udara, serta prakiraan cuaca hingga **7 hari ke depan**. Aplikasi ini memanfaatkan **Open-Meteo API** sebagai sumber data utama dan menghadirkan antarmuka yang modern, responsif, serta mudah digunakan di berbagai perangkat.

Dengan dukungan geolokasi otomatis, pencarian kota yang cepat, grafik suhu interaktif, serta penyimpanan data menggunakan **Local Storage**, SkyCast memberikan pengalaman pemantauan cuaca yang praktis tanpa memerlukan proses login maupun basis data eksternal.

---

## ✨ Fitur Utama

- 🌍 **Data Cuaca Global Real-time**  
  Menampilkan informasi cuaca terkini dari berbagai kota di seluruh dunia menggunakan Open-Meteo API.

- 📍 **Geolokasi Otomatis**  
  Mendeteksi lokasi pengguna melalui HTML5 Geolocation API untuk menampilkan kondisi cuaca setempat secara instan.

- 🔎 **Pencarian Kota dengan Autocomplete**  
  Fitur pencarian cepat yang dilengkapi saran otomatis sehingga pengguna dapat menemukan lokasi dengan lebih mudah.

- 📈 **Grafik Tren Suhu 24 Jam**  
  Visualisasi perubahan suhu selama 24 jam menggunakan **Chart.js** agar data lebih mudah dipahami.

- 📅 **Prakiraan Cuaca 7 Hari**  
  Menampilkan perkiraan cuaca lengkap beserta suhu maksimum dan minimum selama satu minggu ke depan.

- 🌫️ **Informasi Kualitas Udara (AQI)**  
  Menyajikan data kualitas udara sebagai informasi tambahan untuk aktivitas sehari-hari.

- ⭐ **Kota Favorit & Riwayat Pencarian**  
  Memanfaatkan **Local Storage** untuk menyimpan kota favorit dan riwayat pencarian langsung di browser.

- 🌙 **Dark Mode & Light Mode**  
  Mendukung pergantian tema agar tampilan lebih nyaman digunakan pada berbagai kondisi pencahayaan.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|-----------|----------|
| HTML5 | Struktur halaman |
| CSS3 | Styling dan layout |
| Bootstrap 5.3.2 | Responsive UI |
| JavaScript (ES6+) | Logika aplikasi |
| Chart.js | Grafik suhu |
| Font Awesome | Ikon |
| Animate.css | Animasi |
| Open-Meteo API | Data cuaca, geocoding, dan kualitas udara |

---

## 📂 Struktur Proyek

```text
SkyCast/
│── assets/
│   ├── banner.jpeg
│   ├── preview-home.png
│   └── icons/
│
│── index.html
│── style.css
│── script.js
└── README.md

--

## 🚀 Cara Menjalankan

1. Clone repository ini.

```bash
git clone https://github.com/username/skycast.git
```

2. Masuk ke folder proyek.

3. Buka file **index.html** menggunakan browser.

> Tidak memerlukan instalasi maupun database karena seluruh data diperoleh secara langsung melalui Open-Meteo API.

---

## 🎯 Tujuan Proyek

SkyCast dikembangkan sebagai proyek pembelajaran pengembangan web modern dengan menerapkan konsep **Single Page Application (SPA)** menggunakan JavaScript murni (Vanilla JS) serta integrasi API publik. Proyek ini berfokus pada pengalaman pengguna, performa, dan antarmuka yang responsif.

---

## 👩‍💻 Developer

**Damia Zahraa Ramadhani**

SMK Bukit Asam  
Rekayasa Perangkat Lunak (RPL)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pembelajaran, pengembangan portofolio, dan referensi implementasi aplikasi cuaca berbasis web.