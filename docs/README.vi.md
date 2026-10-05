# 🍥 Căn nhà nhỏ của Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Đây là blog cá nhân của tôi — ghi lại những ghi chú khi học tập, những thứ tôi mày mò và bất cứ điều gì đáng để viết ra. Trang được dựng bằng [Astro](https://astro.build) trên nền chủ đề [Fuwari](https://github.com/saicaca/fuwari), kèm theo một nhân vật Live2D, bố cục ba cột và vài trang mở rộng được chuyển từ chủ đề [Mizuki](https://github.com/LyraVoid/Mizuki).

[**🖥️ Xem trang web**](https://007912.xyz)

![Trang chủ](images/home-light.png)

🌏 README bằng
[**English**](https://github.com/Xieluyang912/fuwari/blob/main/README.md) /
[**中文**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.zh-CN.md) /
[**日本語**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Bahasa Indonesia**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.id.md)

## ✨ Tính năng

- [x] Dựng bằng [Astro](https://astro.build) và [Tailwind CSS](https://tailwindcss.com)
- [x] Hiệu ứng và chuyển trang mượt mà nhờ [Swup](https://swup.js.org/)
- [x] Chế độ sáng / tối
- [x] Tùy biến màu chủ đề và ảnh bìa
- [x] Thiết kế đáp ứng (responsive)
- [x] Tìm kiếm toàn văn với [Pagefind](https://pagefind.app/)
- [x] [Cú pháp Markdown mở rộng](#-cú-pháp-markdown-mở-rộng)
- [x] Mục lục (TOC)
- [x] Nguồn cấp RSS
- [x] Bình luận bằng [giscus](https://giscus.app/)
- [x] Nhân vật Live2D ở góc dưới bên trái, kết xuất bằng [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- [x] Thanh bên phải: thống kê trang, lịch bài viết và chuyên mục
- [x] Các trang mở rộng: [Dự án](https://007912.xyz/projects/), [Kỹ năng](https://007912.xyz/skills/), [Công cụ AI](https://007912.xyz/ai-tools/) và [Dòng thời gian](https://007912.xyz/timeline/)

## 🚀 Bắt đầu

Muốn dựng một blog giống thế này?

1. Bắt đầu từ kho lưu trữ này:
    - [Tạo một kho lưu trữ mới](https://github.com/Xieluyang912/fuwari/generate) từ mẫu này, hoặc fork kho lưu trữ này.
    - Bạn cũng có thể khởi tạo chủ đề Fuwari gốc bằng các lệnh dưới đây, nhưng lưu ý rằng cách này **không** có những tùy biến đã nêu ở trên:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. Clone kho lưu trữ về máy và chạy `pnpm install` để cài các gói phụ thuộc.
    - Nếu chưa có [pnpm](https://pnpm.io), hãy cài bằng `npm install -g pnpm`.
3. Sửa tệp cấu hình `src/config.ts` để tùy biến blog: tiêu đề trang, ảnh bìa, thẻ hồ sơ, thanh điều hướng, bình luận, nhân vật Live2D, thanh bên và các trang mở rộng đều nằm ở đây.
4. Chạy `pnpm new-post <tên-tệp>` để tạo bài viết mới rồi chỉnh sửa trong `src/content/posts/`.
5. Trước khi triển khai, đặt `site` và `base` trong `astro.config.mjs`, sau đó triển khai lên Vercel, Netlify, GitHub Pages… theo [hướng dẫn của Astro](https://docs.astro.build/en/guides/deploy/).

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

Phần chủ đề được phát hành theo [Giấy phép MIT](LICENSE). Nội dung bài viết theo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
