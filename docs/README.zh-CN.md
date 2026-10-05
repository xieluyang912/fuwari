# 🍥 Xieluyang 的小屋

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

我的个人博客——记录一些学习笔记、折腾过程，以及任何值得记下来的东西。基于 [Astro](https://astro.build) 构建，主题来自 [Fuwari](https://github.com/saicaca/fuwari)，并移植了 [Mizuki](https://github.com/LyraVoid/Mizuki) 主题的看板娘、右侧栏和一组特色页面。

[**🖥️ 在线访问**](https://007912.xyz)

![首页](images/home-light.png)

🌏 README 语言
[**English**](https://github.com/Xieluyang912/fuwari/blob/main/README.md) /
[**日本語**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.vi.md) /
[**Bahasa Indonesia**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.id.md)

## ✨ 功能特性

- [x] 基于 [Astro](https://astro.build) 和 [Tailwind CSS](https://tailwindcss.com) 开发
- [x] 流畅的动画和页面过渡，由 [Swup](https://swup.js.org/) 驱动
- [x] 亮色 / 暗色模式
- [x] 自定义主题色和横幅图片
- [x] 响应式设计
- [x] 基于 [Pagefind](https://pagefind.app/) 的站内全文搜索
- [x] [Markdown 扩展语法](#-markdown-扩展语法)
- [x] 文内目录（TOC）
- [x] RSS 订阅
- [x] 基于 [giscus](https://giscus.app/) 的评论区
- [x] 左下角 Live2D 看板娘，由 [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) 渲染
- [x] 右侧栏：站点统计、文章日历和分类
- [x] 特色页面：[项目](https://007912.xyz/projects/)、[技能](https://007912.xyz/skills/)、[AI 工具](https://007912.xyz/ai-tools/) 和 [时间线](https://007912.xyz/timeline/)

## 🚀 快速开始

想搭一个和这个一样的博客？

1. 从这个仓库开始：
    - 使用此模板[生成新仓库](https://github.com/Xieluyang912/fuwari/generate)，或者直接 Fork 这个仓库。
    - 也可以用下面的命令初始化原版 Fuwari 主题——注意这样得到的是**不含**上述改造的上游主题：
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. 把仓库 Clone 到本地，执行 `pnpm install` 安装依赖。
    - 若还没装 [pnpm](https://pnpm.io)，先执行 `npm install -g pnpm`。
3. 编辑配置文件 `src/config.ts` 来定制你的博客——站点标题、横幅、个人资料卡、导航栏、评论区、看板娘、右侧栏和特色页面都在这里配置。
4. 执行 `pnpm new-post <文件名>` 创建新文章，然后在 `src/content/posts/` 目录中编辑。
5. 部署前先修改 `astro.config.mjs` 里的 `site` 和 `base`，再参考 [Astro 官方指南](https://docs.astro.build/zh-cn/guides/deploy/)部署至 Vercel、Netlify、GitHub Pages 等平台。

## 📝 文章 Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: zh_CN   # 仅当文章语言与 `config.ts` 中的网站语言不同时才需要设置
---
```

## 🧩 Markdown 扩展语法

除了 Astro 默认支持的 [GitHub Flavored Markdown](https://github.github.com/gfm/)，本站还启用了几个额外的 Markdown 特性：

- **提示块（Admonitions）**，用指令语法书写：

  ```md
  :::note
  需要读者注意的信息。
  :::

  :::tip
  有助于读者更好理解的可选信息。
  :::
  ```

- **GitHub 仓库卡片**，通过 `github` 指令插入：

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **增强代码块**，由 [Expressive Code](https://expressive-code.com/) 提供，支持行号、可折叠区块和复制按钮。

## ⚡ 指令

下列指令均需要在项目根目录执行：

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | 安装依赖                                             |
| `pnpm dev`                 | 在 `localhost:4321` 启动本地开发服务器                |
| `pnpm build`               | 构建网站至 `./dist/`                                 |
| `pnpm preview`             | 本地预览已构建的网站                                  |
| `pnpm check`               | 检查代码中的错误                                      |
| `pnpm format`              | 使用 Biome 格式化代码                                 |
| `pnpm new-post <filename>` | 创建新文章                                           |
| `pnpm astro ...`           | 执行 `astro add`、`astro check` 等指令               |
| `pnpm astro --help`        | 显示 Astro CLI 帮助                                  |

## 🙏 致谢

- [Fuwari](https://github.com/saicaca/fuwari) —— 本站所基于的主题
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— 看板娘、右侧栏和「Others」菜单的移植来源
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— 看板娘渲染库
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 许可

主题部分遵循 [MIT License](LICENSE)。文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。
