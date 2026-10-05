# 🍥 Rumah Kecil Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Blog pribadi saya — tempat mencatat hal-hal yang dipelajari, hal-hal yang saya otak-atik, dan apa pun yang layak dituliskan. Dibangun dengan [Astro](https://astro.build) di atas tema [Fuwari](https://github.com/saicaca/fuwari), lengkap dengan maskot Live2D, tata letak tiga kolom, dan beberapa halaman tambahan yang dipindahkan dari tema [Mizuki](https://github.com/LyraVoid/Mizuki).

[**🖥️ Kunjungi situsnya**](https://007912.xyz)

![Halaman utama](images/home-light.png)

🌏 README dalam
[**English**](https://github.com/Xieluyang912/fuwari/blob/main/README.md) /
[**中文**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.zh-CN.md) /
[**日本語**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.vi.md)

## ✨ Fitur

- [x] Dibangun dengan [Astro](https://astro.build) dan [Tailwind CSS](https://tailwindcss.com)
- [x] Animasi dan transisi halaman yang mulus, berkat [Swup](https://swup.js.org/)
- [x] Mode terang / gelap
- [x] Warna tema dan gambar banner yang bisa disesuaikan
- [x] Desain responsif
- [x] Pencarian teks lengkap dengan [Pagefind](https://pagefind.app/)
- [x] [Sintaks Markdown ekstensi](#-sintaks-markdown-ekstensi)
- [x] Daftar isi
- [x] Umpan RSS
- [x] Komentar dengan [giscus](https://giscus.app/)
- [x] Maskot Live2D di pojok kiri bawah, dirender dengan [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- [x] Bilah sisi kanan: statistik situs, kalender postingan, dan kategori
- [x] Halaman tambahan: [Proyek](https://007912.xyz/projects/), [Keahlian](https://007912.xyz/skills/), [Alat AI](https://007912.xyz/ai-tools/), dan [Lini masa](https://007912.xyz/timeline/)

## 🚀 Memulai

Ingin membuat blog seperti ini?

1. Mulai dari repositori ini:
    - [Buat repositori baru](https://github.com/Xieluyang912/fuwari/generate) dari templat ini, atau fork repositori ini.
    - Anda juga bisa menginisialisasi tema Fuwari asli dengan perintah berikut, tetapi cara ini **tidak** menyertakan penyesuaian yang dijelaskan di atas:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. Clone repositori Anda lalu jalankan `pnpm install` untuk memasang dependensi.
    - Pasang [pnpm](https://pnpm.io) dengan `npm install -g pnpm` jika belum ada.
3. Sunting berkas konfigurasi `src/config.ts` untuk menyesuaikan blog Anda: judul situs, banner, kartu profil, navigasi, komentar, maskot Live2D, bilah sisi, dan halaman tambahan semuanya ada di sana.
4. Jalankan `pnpm new-post <nama-berkas>` untuk membuat postingan baru, lalu sunting di `src/content/posts/`.
5. Sebelum men-deploy, atur `site` dan `base` di `astro.config.mjs`, lalu deploy ke Vercel, Netlify, GitHub Pages, dsb. mengikuti [panduan Astro](https://docs.astro.build/en/guides/deploy/).

## 📝 Frontmatter Postingan

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: id      # Isi hanya jika bahasa postingan berbeda dari bahasa situs di `config.ts`
---
```

## 🧩 Sintaks Markdown Ekstensi

Selain dukungan bawaan Astro untuk [GitHub Flavored Markdown](https://github.github.com/gfm/), ada beberapa fitur Markdown tambahan yang diaktifkan:

- **Admonitions (kotak catatan)**, ditulis dengan sintaks directive:

  ```md
  :::note
  Informasi yang perlu diperhatikan pembaca.
  :::

  :::tip
  Informasi opsional yang membantu pemahaman.
  :::
  ```

- **Kartu repositori GitHub**, disisipkan dengan directive `github`:

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **Blok kode yang ditingkatkan** berkat [Expressive Code](https://expressive-code.com/): nomor baris, bagian yang bisa dilipat, dan tombol salin.

## ⚡ Perintah

Semua perintah dijalankan dari direktori akar proyek:

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | Memasang dependensi                                 |
| `pnpm dev`                 | Menjalankan server pengembangan di `localhost:4321`  |
| `pnpm build`               | Membangun situs produksi ke `./dist/`                |
| `pnpm preview`             | Melihat pratinjau hasil build sebelum deploy         |
| `pnpm check`               | Memeriksa kesalahan pada kode                        |
| `pnpm format`              | Memformat kode dengan Biome                          |
| `pnpm new-post <filename>` | Membuat postingan baru                               |
| `pnpm astro ...`           | Menjalankan perintah CLI seperti `astro add`, `astro check` |
| `pnpm astro --help`        | Menampilkan bantuan Astro CLI                        |

## 🙏 Kredit

- [Fuwari](https://github.com/saicaca/fuwari) —— tema yang menjadi dasar situs ini
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— asal maskot Live2D, bilah sisi kanan, dan menu "Others"
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— pustaka render Live2D
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 Lisensi

Bagian tema dirilis di bawah [Lisensi MIT](LICENSE). Isi postingan menggunakan [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
