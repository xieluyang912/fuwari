---
title: 项目介绍
published: 2026-09-26
description: '这个项目的一个介绍'
image: 'img\TempDragFile_20260926_003035(1).png'
tags: [网站维护]
category: '网站维护'
draft: false 
lang: ''
---
# 项目介绍：Xieluyang 的个人博客

> 一个基于 [Fuwari](https://github.com/saicaca/fuwari) 主题二次开发的纯静态个人博客，
> 用 [Astro](https://astro.build) 构建，源码中所有关键位置都补充了中文注释。

---

## 一、这是什么

这是 **Xieluyang**（四川大学临床医学专业）的个人博客站点。站点本身不含后端服务，
所有页面在构建时一次性生成 HTML，属于标准的**静态站点**（SSG），因此可以零成本托管在
GitHub Pages、Cloudflare、Vercel 等任意静态托管平台上。

目前站内文章以**大创项目**（术前床旁胃超声评估相关研究）资料、网站维护备忘录和随笔为主。

| 项目 | 值 |
|:---|:---|
| 站点标题 | Xieluyang |
| 站点语言 | 简体中文（`zh_CN`） |
| 主题色相 | 250（青色偏蓝），对访客开放调色 |
| 线上地址 | `https://xieluyang912.github.io/fuwari/` |
| 文章数量 | 4 篇（`src/content/posts/`） |

---

## 二、技术栈

### 核心框架

- **Astro 5.13.10** —— 构建框架，负责把 Markdown、组件编译成静态 HTML
- **Svelte 5** —— 用于少数需要客户端交互的组件（搜索框、明暗切换、目录等）
- **Tailwind CSS 3.4** —— 原子化样式方案，开启嵌套语法
- **Stylus** —— 少量全局样式与 CSS 变量定义

### 功能型依赖

| 依赖 | 作用 |
|:---|:---|
| `@swup/astro` | 站内跳转无刷新，带过渡动画 |
| `astro-expressive-code` | 代码块高亮增强（行号、折叠、语言角标、复制按钮） |
| `pagefind` | 构建期生成全文搜索索引 |
| `astro-icon` + Font Awesome 6 | 图标系统，通过 Iconify 名称引用 |
| `katex` / `remark-math` / `rehype-katex` | 数学公式渲染 |
| `photoswipe` | 文章内图片点击放大 |
| `@astrojs/rss` / `@astrojs/sitemap` | RSS 订阅源与 sitemap.xml |
| `reading-time` | 估算文章阅读时长 |

### 工程化

- **pnpm 9.14.4**（`preinstall` 钩子强制只允许 pnpm）
- **Biome 2.2.5** —— 代码格式化与 lint，CI 中执行 `biome ci`
- **TypeScript 5.9** —— 配置对象有完整类型定义，编辑器可提示
- **GitHub Actions** —— 三条工作流：代码质量检查、构建检查、自动部署

---

## 三、目录结构

```
fuwari/
├── astro.config.mjs        # 构建配置：集成、Markdown 管线、部署地址
├── wrangler.jsonc          # Cloudflare Workers 静态托管配置
├── biome.json              # 代码风格规则
├── pagefind.yml            # 搜索索引生成配置
├── scripts/new-post.js     # 新建文章的脚手架脚本
├── docs/                   # 官方多语言 README（11 种语言）
├── public/favicon/         # 不经构建直接复制的静态资源
├── .github/workflows/      # CI：biome.yml / build.yml / deploy.yml
└── src/
    ├── config.ts           # ★ 站点总配置文件，日常只改这一个
    ├── types/config.ts     # 上述配置的类型定义
    ├── content/
    │   ├── config.ts       # 文章 frontmatter 的字段校验规则
    │   ├── posts/          # 所有 Markdown 文章 + img/ 配图
    │   └── spec/about.md   # 「关于」页正文
    ├── layouts/            # Layout.astro（页面骨架）、MainGridLayout.astro（栅格布局）
    ├── pages/              # 路由：首页分页、归档、文章详情、about、rss.xml、robots.txt
    ├── components/
    │   ├── *.astro         # 导航栏、页脚、文章卡片、正文渲染等
    │   ├── control/        # 分页、返回顶部、按钮等小控件
    │   ├── widget/         # 侧边栏：个人资料、分类、标签、目录、显示设置
    │   └── misc/           # 图片包装、版权声明、Markdown 容器
    ├── plugins/            # 自定义 remark / rehype / Expressive Code 插件
    ├── i18n/               # 11 种语言的界面文案
    ├── styles/             # 全局样式、Markdown 样式、代码块与滚动条样式
    ├── utils/              # 内容、日期、URL、设置相关的工具函数
    └── assets/images/      # 横幅图、头像等需要被构建处理的图片
```

---

## 四、功能特性

- **明暗主题 + 自定义主题色** —— 访客可实时调节色相，配色通过 CSS 变量全局联动
- **文章目录（TOC）** —— 基于 `remark-sectionize` 按标题层级切分，右侧浮动导航，随滚动高亮
- **站内全文搜索** —— 构建后由 Pagefind 扫描 `dist/` 生成索引，纯前端检索，无需服务端
- **代码块增强** —— 行号、`--collapse` 折叠、语言角标、自定义复制按钮、diff 与高亮标记
- **Markdown 扩展语法**
  - 提示框：`::note`、`::tip`、`::important`、`::caution`、`::warning`
  - 也兼容 GitHub 的 `> [!NOTE]` 写法
  - GitHub 仓库卡片：`::github{repo="owner/repo"}`
  - 数学公式：行内 `$...$` 与独立 `$$...$$`
- **图片放大** —— 集成 PhotoSwipe，点开文章配图可全屏查看
- **阅读体验细节** —— 自动估算阅读时长、标题锚点链接、自定义滚动条、返回顶部按钮
- **响应式布局** —— 侧边栏在移动端折叠为抽屉式面板
- **RSS 与 SEO** —— 输出 `rss.xml`、`sitemap-index.xml`、`robots.txt`，页面带 OG 标签

---

## 五、配置方式

**日常维护只需要改 `src/config.ts` 一个文件**，它导出五个配置对象：

| 导出常量 | 控制内容 |
|:---|:---|
| `siteConfig` | 标题、副标题、语言、主题色相、首页横幅、favicon |
| `navBarConfig` | 顶部导航链接（内置首页 / 归档 / 关于，可加外链） |
| `profileConfig` | 侧边栏头像、昵称、签名、社交链接 |
| `licenseConfig` | 文章底部版权声明（当前为 CC BY-NC-SA 4.0） |
| `expressiveCodeConfig` | 代码高亮主题 |

> 所有配置在**构建时**被读取并写进静态页面，因此修改后需重新构建才会生效。
> 各项字段的类型定义见 `src/types/config.ts`，编辑器会给出提示与报错。

**部署相关**的配置在 `astro.config.mjs`：`site` 与 `base` 必须与最终访问地址一致，
否则 sitemap、RSS 里的绝对链接和静态资源路径都会出错。当前配置对应
GitHub Pages 的项目仓库地址 `https://xieluyang912.github.io/fuwari/`。

---

## 六、本地开发与构建

环境要求：**Node.js ≥ 20**、**pnpm ≥ 9**（首次使用需 `npm install -g pnpm`）。

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器，默认 http://localhost:4321
pnpm build            # 构建生产版本到 dist/，并自动生成搜索索引
pnpm preview          # 本地预览构建产物
pnpm check            # 检查类型与代码错误
pnpm new-post <文件名> # 新建一篇文章
pnpm format           # 用 Biome 格式化 src/
pnpm lint             # 用 Biome 检查并自动修复 src/
```

---

## 七、内容写作

新建文章推荐用 `pnpm new-post <文件名>`，生成的文件位于 `src/content/posts/`，
顶部 frontmatter 格式如下：

```yaml
---
title: 文章标题
published: 2026-09-25
description: 文章摘要，用于列表页展示和 SEO 描述
image: 'img/cover.png'    # 封面图，相对当前文章目录
tags: [标签一, 标签二]
category: 分类名
draft: false              # 为 true 时不会被构建进站点
lang: ''                  # 仅当文章语言与站点语言不同时才填
---
```

配图统一放在 `src/content/posts/img/` 下，用相对路径引用。

---

## 八、部署

站内已配置两条部署路径，二选一即可：

### 1. GitHub Pages（当前主用）

`.github/workflows/deploy.yml` 会在推送到 `main` 分支时自动执行：
安装依赖 → `pnpm build` → 上传 `dist/` → 发布到 Pages。

前置条件：仓库 **Settings → Pages → Source** 需设为 **"GitHub Actions"**。
CI 中使用 `--frozen-lockfile`，保证依赖版本与本地一致。

### 2. Cloudflare Workers（静态资源模式）

站点是纯静态的，不需要 adapter 也不需要 Worker 脚本，Cloudflare 直接把 `dist/` 当静态资源托管：

```bash
pnpm build && npx wrangler deploy
```

配置见 `wrangler.jsonc`，Worker 名为 `xieluyang-blog`。
两个平台互不影响，可以同时存在。

### 辅助工作流

- `build.yml` —— 在 Node 22 / 23 两个版本上跑 `astro check` 与 `astro build`，确保兼容性
- `biome.yml` —— 代码风格检查

---

## 九、相对原主题的改动

相比上游 [saicaca/fuwari](https://github.com/saicaca/fuwari)，本仓库主要做了以下本地化调整：

1. **全量中文注释** —— `src/config.ts`、`astro.config.mjs`、`wrangler.jsonc`、
   `.github/workflows/deploy.yml` 等关键文件都写明了每个配置项的作用与注意事项，
   降低了后续维护（尤其是隔一段时间回来改）的成本。
2. **站点信息替换** —— 标题、语言、主题色、导航链接、个人资料卡片、横幅图均改为本站内容。
3. **部署地址适配** —— `site` / `base` 调整为 GitHub Pages 项目仓库形式，
   并新增 GitHub Pages 自动部署工作流。
4. **内容填充** —— 新增自我介绍、大创项目资料、网站维护备忘录等文章与配套配图。

---

## 十、参考

- Fuwari 主题：<https://github.com/saicaca/fuwari>
- Astro 文档：<https://docs.astro.build>
- Expressive Code 文档：<https://expressive-code.com>
- Pagefind 文档：<https://pagefind.app>
- 本项目源码：<https://github.com/xieluyang912/fuwari>

## 许可

主题部分遵循 [MIT License](LICENSE)。文章内容采用
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。
