# 🍥 Xieluyang's Blog

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

My personal blog — notes from studying, things I tinker with, and anything else worth writing down. Built with [Astro](https://astro.build) on top of the [Fuwari](https://github.com/saicaca/fuwari) theme, with a Live2D mascot, a three-column layout and a few extra pages ported from the [Mizuki](https://github.com/LyraVoid/Mizuki) theme.

[**🖥️ Live Site**](https://007912.xyz)

![Homepage](docs/images/home-light.png)

🌏 README in
[**中文**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.zh-CN.md) /
[**日本語**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.vi.md) /
[**Bahasa Indonesia**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.id.md)

## ✨ Features

- [x] Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- [x] Smooth animations and page transitions, powered by [Swup](https://swup.js.org/)
- [x] Light / dark mode
- [x] Customizable theme color & banner
- [x] Responsive design
- [x] Full-text search with [Pagefind](https://pagefind.app/)
- [x] [Markdown extended features](#-markdown-extended-syntax)
- [x] Table of contents
- [x] RSS feed
- [x] Comments via [giscus](https://giscus.app/)
- [x] Live2D mascot in the bottom-left corner, rendered with [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- [x] Right sidebar with site statistics, a post calendar and categories
- [x] Extra pages: [Projects](https://007912.xyz/projects/), [Skills](https://007912.xyz/skills/), [AI Tools](https://007912.xyz/ai-tools/) and [Timeline](https://007912.xyz/timeline/)

## 🚀 Getting Started

Want to build a blog like this one?

1. Start from this repository:
    - [Generate a new repository](https://github.com/Xieluyang912/fuwari/generate) from this template, or fork this repository.
    - Alternatively, scaffold the original Fuwari theme with one of these commands — note that this gives you the upstream theme **without** the customizations described above:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. Clone your repository and run `pnpm install` to install the dependencies.
    - Install [pnpm](https://pnpm.io) with `npm install -g pnpm` if you haven't already.
3. Edit the config file `src/config.ts` to customize your blog — site title, banner, profile card, navigation, comments, the Live2D mascot, the sidebar and the extra pages all live there.
4. Run `pnpm new-post <filename>` to create a new post, then edit it in `src/content/posts/`.
5. Before deploying, set `site` and `base` in `astro.config.mjs`, then deploy to Vercel, Netlify, GitHub Pages, etc. following [the Astro guides](https://docs.astro.build/en/guides/deploy/).

## 📝 Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: en      # Set only if the post's language differs from the site's language in `config.ts`
---
```

## 🧩 Markdown Extended Syntax

In addition to Astro's default support for [GitHub Flavored Markdown](https://github.github.com/gfm/), several extra Markdown features are included:

- **Admonitions**, written as directives:

  ```md
  :::note
  Highlights information that users should take into account.
  :::

  :::tip
  Optional information to help a user be more successful.
  :::
  ```

- **GitHub repository cards**, via the `github` directive:

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **Enhanced code blocks** powered by [Expressive Code](https://expressive-code.com/), with line numbers, collapsible sections and a copy button.

## ⚡ Commands

All commands are run from the root of the project, from a terminal:

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | Installs dependencies                               |
| `pnpm dev`                 | Starts local dev server at `localhost:4321`         |
| `pnpm build`               | Build your production site to `./dist/`             |
| `pnpm preview`             | Preview your build locally, before deploying        |
| `pnpm check`               | Run checks for errors in your code                  |
| `pnpm format`              | Format your code using Biome                        |
| `pnpm new-post <filename>` | Create a new post                                   |
| `pnpm astro ...`           | Run CLI commands like `astro add`, `astro check`    |
| `pnpm astro --help`        | Get help using the Astro CLI                        |

## 🙏 Credits

- [Fuwari](https://github.com/saicaca/fuwari) — the theme this site is built on
- [Mizuki](https://github.com/LyraVoid/Mizuki) — where the Live2D mascot, the right sidebar and the "Others" menu are ported from
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) — the Live2D rendering library
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 License

The theme is licensed under the [MIT License](LICENSE). Blog posts are published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
