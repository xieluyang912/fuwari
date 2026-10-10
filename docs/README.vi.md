<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/hero-dark.svg">
    <img src="../assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog —— blog cá nhân dựng trên chủ đề Fuwari, có nhân vật Live2D ở góc dưới bên trái và bố cục ba cột: thẻ hồ sơ, danh sách bài viết và thanh thống kê bên phải.">
  </picture>
</p>

# 🍥 Căn nhà nhỏ của Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Đây là blog cá nhân của tôi — ghi lại những ghi chú khi học tập, những thứ tôi mày mò và bất cứ điều gì đáng để viết ra.

Trang được dựng bằng [Astro](https://astro.build) trên nền chủ đề [Fuwari](https://github.com/saicaca/fuwari), kèm theo một nhân vật Live2D, bố cục ba cột và vài trang mở rộng được chuyển từ chủ đề [Mizuki](https://github.com/LyraVoid/Mizuki).

**🖥️ Đọc tại [007912.xyz](https://007912.xyz)**

![Trang chủ——ảnh bìa, thẻ hồ sơ, danh sách bài viết và thanh thống kê bên phải (chế độ sáng)](images/home-light.png)

🌏 **README bằng:** [English](../README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

## ✨ Tính năng

**Viết lách**

- [Cú pháp Markdown mở rộng](#-cú-pháp-markdown-mở-rộng) —— khối lưu ý, thẻ kho lưu trữ GitHub và khối mã [Expressive Code](https://expressive-code.com/) có số dòng cùng phần thu gọn
- Mục lục (TOC) trong mọi bài viết
- Tìm kiếm toàn văn với [Pagefind](https://pagefind.app/) và nguồn cấp RSS
- Bình luận bằng [giscus](https://giscus.app/)

**Giao diện**

- Chế độ sáng / tối, tùy biến được màu chủ đề và ảnh bìa
- Bố cục đáp ứng (responsive) và chuyển trang mượt mà nhờ [Swup](https://swup.js.org/)
- Dựng bằng [Astro](https://astro.build) và [Tailwind CSS](https://tailwindcss.com)

**Thêm vào so với chủ đề Fuwari gốc**

- Nhân vật Live2D ở góc dưới bên trái, kết xuất bằng [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- Cột thứ ba bên phải —— thống kê trang, lịch bài viết và chuyên mục
- Các trang mở rộng: [Dự án](https://007912.xyz/projects/), [Kỹ năng](https://007912.xyz/skills/), [Công cụ AI](https://007912.xyz/ai-tools/) và [Dòng thời gian](https://007912.xyz/timeline/)

## 🚀 Bắt đầu

1. **Lấy mã nguồn.** Fork kho lưu trữ này, hoặc [tạo một kho lưu trữ mới](https://github.com/Xieluyang912/fuwari/generate) từ mẫu này.

    Muốn dùng chủ đề Fuwari gốc **không** có những tùy biến ở trên? Hãy khởi tạo trực tiếp bằng:

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **Cài các gói phụ thuộc** bằng `pnpm install`. Nếu chưa có [pnpm](https://pnpm.io), hãy chạy `npm install -g pnpm` trước.
3. **Cấu hình blog** trong `src/config.ts`: tiêu đề trang, ảnh bìa, thẻ hồ sơ, thanh điều hướng, bình luận, nhân vật Live2D, thanh bên và các trang mở rộng đều nằm ở đây.
4. **Viết bài đầu tiên** bằng `pnpm new-post <tên-tệp>` rồi chỉnh sửa trong `src/content/posts/`.
5. **Triển khai.** Đặt `site` và `base` trong `astro.config.mjs`, sau đó làm theo [hướng dẫn triển khai của Astro](https://docs.astro.build/en/guides/deploy/) lên Vercel, Netlify, GitHub Pages…

## 📝 Frontmatter của bài viết

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: vi      # Chỉ đặt khi ngôn ngữ của bài viết khác với ngôn ngữ trang trong `config.ts`
---
```

## 🧩 Cú pháp Markdown mở rộng

Ngoài [GitHub Flavored Markdown](https://github.github.com/gfm/) mà Astro hỗ trợ sẵn, trang còn bật thêm vài tính năng Markdown:

- **Admonitions (khối lưu ý)**, viết dưới dạng directive:

  ```md
  :::note
  Thông tin người đọc nên lưu tâm.
  :::

  :::tip
  Thông tin bổ sung giúp hiểu rõ hơn.
  :::
  ```

- **Thẻ kho lưu trữ GitHub**, chèn bằng directive `github`:

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **Khối mã nâng cao** nhờ [Expressive Code](https://expressive-code.com/): số dòng, phần thu gọn và nút sao chép.

## ⚡ Lệnh

Tất cả lệnh đều chạy từ thư mục gốc của dự án:

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | Cài đặt các gói phụ thuộc                            |
| `pnpm dev`                 | Chạy máy chủ phát triển tại `localhost:4321`         |
| `pnpm build`               | Dựng trang production vào `./dist/`                  |
| `pnpm preview`             | Xem trước bản dựng ở máy trước khi triển khai        |
| `pnpm check`               | Kiểm tra lỗi trong mã nguồn                          |
| `pnpm format`              | Định dạng mã bằng Biome                              |
| `pnpm new-post <filename>` | Tạo bài viết mới                                     |
| `pnpm astro ...`           | Chạy các lệnh CLI như `astro add`, `astro check`     |
| `pnpm astro --help`        | Xem trợ giúp của Astro CLI                           |

## 🙏 Ghi công

- [Fuwari](https://github.com/saicaca/fuwari) —— chủ đề mà trang này dựa trên
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— nguồn gốc của nhân vật Live2D, thanh bên phải và menu «Others»
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— thư viện kết xuất Live2D
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 Giấy phép

Phần chủ đề được phát hành theo [Giấy phép MIT](../LICENSE). Nội dung bài viết theo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
