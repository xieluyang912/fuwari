<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/readme/hero-dark.svg">
    <img src="./assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog — a personal blog built on the Fuwari Astro theme, with a Live2D mascot pinned to the bottom-left corner and a three-column layout: a profile card, a post list and a statistics sidebar.">
  </picture>
</p>

# 🍥 Xieluyang's Blog

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

My personal blog — notes from studying, things I tinker with, and anything else worth writing down.

It is built with [Astro](https://astro.build) on top of the [Fuwari](https://github.com/saicaca/fuwari) theme, with a Live2D mascot, a three-column layout, and a few extra pages ported from the [Mizuki](https://github.com/LyraVoid/Mizuki) theme.

**🖥️ Read it at [007912.xyz](https://007912.xyz)**

![The blog homepage in light mode — banner, profile card, post list and the statistics sidebar](docs/images/home-light.png)

🌏 **README in:** [中文](docs/README.zh-CN.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md) · [Español](docs/README.es.md) · [ไทย](docs/README.th.md) · [Tiếng Việt](docs/README.vi.md) · [Bahasa Indonesia](docs/README.id.md)

## ✨ Features

**Writing**

- [Markdown extended syntax](#-markdown-extended-syntax) — admonitions, GitHub repository cards, and [Expressive Code](https://expressive-code.com/) blocks with line numbers and collapsible sections
- Table of contents on every post
- Full-text search with [Pagefind](https://pagefind.app/) and an RSS feed
- Comments via [giscus](https://giscus.app/)

**Look and feel**

- Light / dark mode, with a customizable theme color and banner
- Responsive layout and smooth page transitions, powered by [Swup](https://swup.js.org/)
- Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)

**Beyond the upstream Fuwari theme**

- A Live2D mascot in the bottom-left corner, rendered with [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- A third column on the right — site statistics, a post calendar and categories
- Extra pages: [Projects](https://007912.xyz/projects/), [Skills](https://007912.xyz/skills/), [AI Tools](https://007912.xyz/ai-tools/) and [Timeline](https://007912.xyz/timeline/)

## 🚀 Getting Started

1. **Get the code.** Fork this repository, or [generate a new one from the template](https://github.com/Xieluyang912/fuwari/generate).

    Prefer the original theme without the extras listed above? Scaffold it directly instead:

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **Install the dependencies** with `pnpm install`. If you don't have pnpm yet, run `npm install -g pnpm` first.
3. **Configure your blog** in `src/config.ts` — the site title, banner, profile card, navigation, comments, the Live2D mascot, the right sidebar and the extra pages all live there.
4. **Write your first post** with `pnpm new-post <filename>`, then edit the file in `src/content/posts/`.
5. **Deploy.** Set `site` and `base` in `astro.config.mjs`, then follow the [Astro deployment guides](https://docs.astro.build/en/guides/deploy/) for Vercel, Netlify, GitHub Pages, or anywhere else.

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

| Command                    | Action                                           |
|:---------------------------|:-------------------------------------------------|
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`                 | Starts local dev server at `localhost:4321`      |
| `pnpm build`               | Build your production site to `./dist/`          |
| `pnpm preview`             | Preview your build locally, before deploying     |
| `pnpm check`               | Run checks for errors in your code               |
| `pnpm format`              | Format your code using Biome                     |
| `pnpm new-post <filename>` | Create a new post                                |
| `pnpm astro ...`           | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro --help`        | Get help using the Astro CLI                     |

## 🙏 Credits

- [Fuwari](https://github.com/saicaca/fuwari) — the theme this site is built on
- [Mizuki](https://github.com/LyraVoid/Mizuki) — where the Live2D mascot, the right sidebar and the "Others" menu are ported from
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) — the Live2D rendering library
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 License

The theme is licensed under the [MIT License](LICENSE). Blog posts are published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
