<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/hero-dark.svg">
    <img src="../assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog —— blog pribadi yang dibangun di atas tema Fuwari, dengan maskot Live2D di pojok kiri bawah dan tata letak tiga kolom: kartu profil, daftar postingan, dan bilah statistik di kanan.">
  </picture>
</p>

# 🍥 Rumah Kecil Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Blog pribadi saya — tempat mencatat hal-hal yang dipelajari, hal-hal yang saya otak-atik, dan apa pun yang layak dituliskan.

Dibangun dengan [Astro](https://astro.build) di atas tema [Fuwari](https://github.com/saicaca/fuwari), lengkap dengan maskot Live2D, tata letak tiga kolom, dan beberapa halaman tambahan yang dipindahkan dari tema [Mizuki](https://github.com/LyraVoid/Mizuki).

**🖥️ Baca di [007912.xyz](https://007912.xyz)**

![Halaman utama——banner, kartu profil, daftar postingan, dan bilah statistik di kanan (mode terang)](images/home-light.png)

🌏 **README dalam:** [English](../README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md)

## ✨ Fitur

**Menulis**

- [Sintaks Markdown ekstensi](#-sintaks-markdown-ekstensi) —— kotak catatan, kartu repositori GitHub, dan blok kode [Expressive Code](https://expressive-code.com/) dengan nomor baris serta bagian yang bisa dilipat
- Daftar isi di setiap postingan
- Pencarian teks lengkap dengan [Pagefind](https://pagefind.app/) dan umpan RSS
- Komentar dengan [giscus](https://giscus.app/)

**Tampilan**

- Mode terang / gelap, dengan warna tema dan gambar banner yang bisa disesuaikan
- Tata letak responsif dan transisi halaman yang mulus berkat [Swup](https://swup.js.org/)
- Dibangun dengan [Astro](https://astro.build) dan [Tailwind CSS](https://tailwindcss.com)

**Di atas tema Fuwari asli**

- Maskot Live2D di pojok kiri bawah, dirender dengan [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- Kolom ketiga di kanan —— statistik situs, kalender postingan, dan kategori
- Halaman tambahan: [Proyek](https://007912.xyz/projects/), [Keahlian](https://007912.xyz/skills/), [Alat AI](https://007912.xyz/ai-tools/), dan [Lini masa](https://007912.xyz/timeline/)

## 🚀 Memulai

1. **Ambil kodenya.** Fork repositori ini, atau [buat repositori baru](https://github.com/Xieluyang912/fuwari/generate) dari templat ini.

    Ingin tema Fuwari asli **tanpa** penyesuaian di atas? Inisialisasi langsung dengan:

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **Pasang dependensi** dengan `pnpm install`. Jika belum ada [pnpm](https://pnpm.io), jalankan `npm install -g pnpm` lebih dulu.
3. **Konfigurasi blog Anda** di `src/config.ts`: judul situs, banner, kartu profil, navigasi, komentar, maskot Live2D, bilah sisi, dan halaman tambahan semuanya ada di sana.
4. **Tulis postingan pertama** dengan `pnpm new-post <nama-berkas>`, lalu sunting di `src/content/posts/`.
5. **Deploy.** Atur `site` dan `base` di `astro.config.mjs`, lalu ikuti [panduan deploy Astro](https://docs.astro.build/en/guides/deploy/) ke Vercel, Netlify, GitHub Pages, dsb.

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

Bagian tema dirilis di bawah [Lisensi MIT](../LICENSE). Isi postingan menggunakan [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
