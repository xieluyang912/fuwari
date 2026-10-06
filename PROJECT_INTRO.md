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
├── pagefind.yml             # 搜索索引生成配置
├── scripts/new-post.js     # 新建文章的脚手架脚本（按文件夹方案生成）
├── scripts/anime/          # B 站同步：追番 / 投币 / 勋章 / 收藏集 + 快照落盘
├── docs/                   # 官方多语言 README + 各功能的详细说明
├── public/favicon/         # 不经构建直接复制的静态资源
├── public/pio/             # 看板娘资源：oh-my-live2d 控件 + NOIR 模型 + 宿主页
├── public/assets/anime/    # 追番封面（同步阶段下载，避开 B 站图床防盗链）
├── .github/workflows/      # CI：biome.yml / build.yml / deploy.yml
└── src/
    ├── config.ts           # ★ 站点总配置文件，日常只改这一个
    ├── config/             # 体量较大、自带说明的独立配置
    │   ├── umamiConfig.ts  #   Umami 访问统计（默认关闭）
    │   └── animeConfig.ts  #   追番页与 B 站数据源
    ├── user/user-config.ts # 用户覆盖层：不改默认值也能覆盖配置
    ├── types/config.ts     # 上述配置的类型定义
    ├── data/anime.ts       # 追番数据模型 + 本地兜底数据
    ├── data/bilibili.ts    # 投币视频 / 粉丝勋章 / 数字收藏集的数据模型
    ├── data/anime-snapshots/ # pnpm anime:sync 生成的快照（提交进 Git）
    ├── content/
    │   ├── config.ts       # 文章 frontmatter 的字段校验规则
    │   ├── posts/          # 文章：一篇文章一个文件夹，index.md + 就近存放的配图
    │   └── spec/about.md   # 「关于」页正文
    ├── layouts/            # Layout.astro（页面骨架）、MainGridLayout.astro（栅格布局）
    ├── pages/              # 路由：首页分页、归档、文章详情、about、rss.xml、robots.txt
    │   ├── projects.astro  # Others → 项目展示
    │   ├── skills.astro    # Others → 技能
    │   ├── ai-tools.astro  # Others → AI 工具导航
    │   ├── timeline.astro  # Others → 时间线
    │   ├── tags.astro      # 标签总览（左栏只放一部分标签）
    │   ├── anime.astro     # B 站：追番 + 最近投币
    │   ├── medals.astro    # 粉丝勋章
    │   ├── collections.astro # 数字收藏集（装扮体系的卡牌，不是收藏夹）
    │   └── api/calendar-data.json.ts  # 日历用的文章数据接口（构建成静态 JSON）
    ├── components/
    │   ├── *.astro         # 导航栏、页脚、文章卡片、正文渲染等
    │   ├── control/        # 分页、返回顶部、按钮等小控件
    │   ├── system/         # UmamiRuntime.astro：统计脚本的一次性挂载点
    │   ├── widget/         # 侧边栏：个人资料、分类、标签、目录、显示设置
    │   │   ├── RightSideBar.astro     # 右侧栏容器（统计/访问统计/日历/分类）
    │   │   ├── SiteStats.astro        # 站点统计
    │   │   ├── UmamiStats.astro       # 访问统计（Umami 公开分享接口）
    │   │   ├── Calendar.astro         # 日历（交互逻辑在 calendar/ 下的 Svelte 组件）
    │   │   ├── Pio.astro              # 左下角 Live2D 看板娘
    │   │   ├── DropdownMenu.astro     # 顶栏下拉菜单（Others 按钮）
    │   │   └── NavMenuPanel.astro     # 移动端汉堡菜单
    │   └── misc/           # 图片包装、版权声明、Markdown 容器、giscus 评论区、页面标题
    ├── plugins/            # 自定义 remark / rehype / Expressive Code 插件
    │   └── markdown/core/bilibili.mjs #   ::bilibili{} 的参数校验与 URL 生成
    ├── i18n/               # 11 种语言的界面文案
    ├── styles/             # 全局样式、Markdown 样式、代码块与滚动条样式
    ├── utils/              # 内容、日期、URL、设置相关的工具函数
    │   ├── umami.ts        #   Umami 公开分享接口的读取（构建期）
    │   ├── anime-data.ts   #   追番数据的读取与降级
    │   ├── anime/normalize.ts # 追番条目的校验与归一化
    │   ├── bilibili-data.ts #  投币 / 勋章 / 收藏集的读取与降级
    │   ├── bilibili/normalize.ts # 上述三类数据的校验与归一化
    │   ├── snapshot.ts     #   快照读取的公共逻辑（四块共用）
    │   └── bilibili.ts     #   视频门面的客户端激活
    └── assets/images/      # 横幅图、头像等需要被构建处理的图片
```

---

## 四、功能特性

- **明暗主题 + 自定义主题色** —— 访客可实时调节色相，配色通过 CSS 变量全局联动
- **整体版式对齐 Mizuki 参考站**（<https://mizuki.mysqil.com/>）：
  - **页面栅格** —— 整页宽 90rem，单侧栏 17.5rem。手机上单栏（正文 → 左栏 → 右栏 → 页脚），
    768px 起变成「左栏 | 正文」两栏，1280px 起变成「左栏 | 正文 | 右栏」三栏
  - **波浪横幅** —— 首页横幅 65vh，正中是站点大标题 + 副标题（靠文字阴影保证可读性，
    不给整幅图加遮罩）。底部一条 4 层 SVG 波浪：同一条路径叠 4 次，靠不同的
    y 偏移 / 不透明度 / 动画时长做出水波错位的视差，填充色就是页面底色，
    所以换主题色、切深浅模式时波浪会自动跟着变
  - **透明悬浮导航栏** —— 顶部完全透明让横幅透出来，往下滚 50px 后变成毛玻璃卡片
    （浅色白 55% / 深色黑 55% + 20px 模糊）
  - **首页分类筛选条** —— 一条独立的卡片，横向排出「🏠 | 归档 N | 各分类 N」，
    可横向滚动、两侧有渐隐提示、当前分类会高亮
  - **文章卡片** —— 标题前的主题色竖线、图标小块式的元信息（日期 / 分类 / 字数）、
    摘要、`# 标签` chip 行，右侧封面或箭头按钮；卡片之间有极淡的描边和投影
- **左侧栏** —— 个人资料 → 公告 → 标签 →（文章页）目录。
  其中标签只显示一部分，底部给一个「查看全部标签」入口通向 `/tags/`；
  标签很多时不会把左栏撑得比正文还长
- **标签总览页 `/tags/`** —— 完整标签列表，字号随文章数缩放，
  可选按首字母分组；纯静态直出，没有任何客户端脚本
- **文章目录（TOC）** —— 基于 `remark-sectionize` 按标题层级切分，跟随滚动高亮；
  在三栏布局下放进左侧栏的卡片里（参考站的做法），不再占用第四条浮动栏
- **站内全文搜索** —— 构建后由 Pagefind 扫描 `dist/` 生成索引，纯前端检索，无需服务端
- **代码块增强** —— 行号、`--collapse` 折叠、语言角标、自定义复制按钮、diff 与高亮标记
- **Markdown 扩展语法**
  - 提示框：`::note`、`::tip`、`::important`、`::caution`、`::warning`
  - 也兼容 GitHub 的 `> [!NOTE]` 写法
  - GitHub 仓库卡片：`::github{repo="owner/repo"}`
  - B 站视频门面：`::bilibili{bvid="BV..." p=1}` ——
    构建期只输出一张静态占位卡片，**点击播放前不与 B 站发生任何连接**
    （无 iframe、无第三方脚本、无 Cookie）；参数写错会原样降级成文本，避免静默消失
  - 数学公式：行内 `$...$` 与独立 `$$...$$`
- **图片放大** —— 集成 PhotoSwipe，点开文章配图可全屏查看
- **阅读体验细节** —— 自动估算阅读时长、标题锚点链接、自定义滚动条、返回顶部按钮
- **响应式布局** —— 小屏幕下左右侧栏都折到正文下方，功能一个都不少
- **公告卡片** —— 左栏顶部可放一条公告，访客点 × 关掉后记在 localStorage 里不再打扰
- **RSS 与 SEO** —— 输出 `rss.xml`、`sitemap-index.xml`、`robots.txt`，页面带 OG 标签
- **评论区** —— 用 giscus 嵌入 GitHub Discussions，评论数据存在仓库里，
  不需要服务器或数据库；评论区配色跟随站点明暗模式，无刷新跳转后也能正常加载
- **左下角 Live2D 看板娘** —— 用透明 iframe 隔离 [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
  渲染模型，可鼠标拖动、会说话、支持点击互动；手机端自动隐藏。
  放在 Swup 替换容器之外，跳页时模型不会重新加载
- **右侧栏** —— 1280px 及以上是「左栏 | 正文 | 右栏」三栏，小屏幕时右栏内容
  折到正文下方，功能不丢失：
  - **站点统计** —— 文章数 / 分类数 / 标签数 / 总字数 / 运行天数 / 最近更新，
    其中后两项由浏览器实时计算（构建时算的值会过期）
  - **日历** —— 有文章的日子标点，点某天筛出当天文章；点标题可逐层切到
    月份 / 年份视图；正在阅读的文章会自动定位到对应月份
  - **分类** —— 带文章数徽标
  - **访问统计** —— 接入 [Umami](https://umami.is)（开源自托管分析服务）。
    两个能力层彼此独立：公开分享统计（只填 `shareUrl`）与访问采集
    （需同时填 `websiteId` + `scriptUrl`）。**默认全局关闭**，关闭时零请求、
    零 DOM、零包体积；开启后数字有「构建期抓取 + 浏览器端刷新」两条来源，
    构建期那份保证首屏就有真实数值、且访客端即使取不到数据也不会空白
- **B 站四个数据页** —— 全部由 `pnpm anime:sync` 在构建前抓取，各写一份本地 JSON 快照。
  **构建期与页面运行时都不访问外部接口**，B 站挂了不会影响博客发布：
  - **`/anime/` 追番** —— 按「在看 / 看过 / 想看」分组，展示封面、评分、进度
  - **`/anime/` 最近投币** —— 最近投过币的视频，按投币时间倒序（不是发布时间）
  - **`/medals/` 粉丝勋章** —— 直播间勋章墙，按 B 站直播间那枚勋章的样子渲染配色
  - **`/collections/` 数字收藏集** —— 装扮体系的付费数字卡牌，
    显示「已收集 X / Y」与已有卡面
  封面在同步阶段下载到站内，避开图床防盗链，访客端零第三方请求。
  前两块不需要登录态，后两块需要 `.env` 里的 `BILI_SESSDATA`
- **顶栏 Others 下拉菜单** —— 支持任意层级的下拉菜单配置（`navLink.children`），
  键盘可达（↑↓ 移动、Esc 关闭、Enter 展开），移动端自动变成可折叠分组。
  当前挂了 8 个页面：
  - **`/projects/` 项目展示** —— 卡片列表，支持置顶、封面图、标签、项目主页与源码链接
  - **`/skills/` 技能** —— 按分组展示，填了 `level` 会画熟练度进度条
  - **`/ai-tools/` AI 工具导航** —— 按 `category` 自动分组
  - **`/timeline/` 时间线** —— 按日期自动倒序，不同类型节点配色不同
  - **`/tags/` 标签总览**
  - **`/anime/` B 站**（追番 + 最近投币；`animeConfig.enable` 关掉时该入口一并隐藏）
  - **`/medals/` 粉丝勋章**
  - **`/collections/` 数字收藏集**
  这些页面的内容全部由 `src/config.ts` 与 `src/config/*Config.ts` 里的配置数组驱动，
  改配置即可增删

---

## 五、配置方式

**日常维护只需要改 `src/config.ts` 一个文件**，它导出以下配置对象：

| 导出常量 | 控制内容 |
|:---|:---|
| `siteConfig` | 标题、副标题、语言、主题色相、首页横幅（含正中的大标题/副标题）、favicon、建站日期 |
| `navBarConfig` | 顶部导航链接（内置首页 / 归档 / 关于 / 4 个特色页，支持 `children` 下拉） |
| `profileConfig` | 侧边栏头像、昵称、签名、社交链接 |
| `announcementConfig` | 左侧栏的公告卡片（内容、按钮、开关） |
| `licenseConfig` | 文章底部版权声明（当前为 CC BY-NC-SA 4.0） |
| `commentConfig` | 文章底部评论区（giscus，评论存放在 GitHub Discussions） |
| `expressiveCodeConfig` | 代码高亮主题 |
| `pioConfig` | 左下角 Live2D 看板娘：开关、模型、位置、尺寸、台词 |
| `sidebarConfig` | 右侧栏开关，以及 4 个小部件的显示与排序（含访问统计） |
| `tagsConfig` | 标签：左栏显示上限、排序、`/tags/` 页面的分组与缩放 |
| `projectsConfig` | `/projects/` 页面的项目列表 |
| `skillsConfig` | `/skills/` 页面的技能分组 |
| `aiToolsConfig` | `/ai-tools/` 页面的工具列表 |
| `timelineConfig` | `/timeline/` 页面的事件列表 |

体量较大、自带一套说明的配置被拆成了独立文件（同样从 `src/config.ts` 统一导出）：

| 文件 | 控制内容 |
|:---|:---|
| `src/config/umamiConfig.ts` | Umami 访问统计：总开关、分享链接、Website ID、采集脚本 |
| `src/config/animeConfig.ts` | 追番页：数据源、B 站 UID、封面策略、快照目录 |

> 所有配置在**构建时**被读取并写进静态页面，因此修改后需重新构建才会生效。
> 各项字段的类型定义见 `src/types/config.ts`（独立配置见 `src/types/*Config.ts`），
> 编辑器会给出提示与报错。

**不想改主题自带的默认值**时，可以写到 `src/user/user-config.ts` 的
`userConfigOverrides` 里，合并规则是「对象递归合并、数组整体替换」
（见 `src/utils/config-overlay.ts`）。这样升级主题时默认值可以整份替换，
不会覆盖你的配置。

**各功能的详细说明**（配置项、实现原理、易踩的坑）都在 `docs/` 下：

| 文档 | 内容 |
|:---|:---|
| [`docs/tags.md`](docs/tags.md) | 标签：左栏截断规则、`/tags/` 总览页、标签链接的路由落点 |
| [`docs/umami.md`](docs/umami.md) | Umami 统计：两层能力的开关、域名绑定要求、构建期/运行时双数据源 |
| [`docs/bilibili.md`](docs/bilibili.md) | B 站：追番 / 投币 / 粉丝勋章 / 数字收藏集四套同步 + 视频门面嵌入 |
| [`docs/post-folders.md`](docs/post-folders.md) | 文章文件夹方案：目录结构、引用方式、路由规则 |

**几个容易踩的点：**

- `siteConfig.siteStartDate` 决定「运行天数」从哪天算起，格式 `YYYY-MM-DD`。
- 看板娘的模型文件放在 `public/pio/models/` 下，配置里写 `/pio/models/xxx/xxx.model3.json`。
  换模型时把整个模型文件夹拷进来即可，注意 `.model3.json` 里引用贴图用的是相对路径。
- 不想用右侧栏就把 `sidebarConfig.enable` 改成 `false`，布局会自动退回原来的
  「左栏 + 正文」两栏，同时分类会回到左侧栏，不会丢功能。

**启用评论区**需要先在 GitHub 上做准备，`commentConfig` 只是前端这一半：

1. 仓库必须是**公开**的 —— giscus 读不到私有仓库的 Discussions
2. 仓库 `Settings → General → Features` 里勾选 **Discussions**
3. 到 <https://github.com/apps/giscus> 安装 giscus App，并授权访问该仓库
4. 在 Discussions 里建一个分类，推荐用 **Announcements** 类型 —— 这样只有
   giscus 机器人能发起 discussion，访客无法自己开新帖
5. 打开 <https://giscus.app> 填入仓库名和分类，页面会给出 `repoId` 与
   `categoryId`，复制回 `commentConfig.giscus` 即可

`repoId` / `categoryId` 留空时，`pnpm build` 会在终端打印提醒，不会静默失败。

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

新建文章推荐用 `pnpm new-post <文件名>`，它会按**文件夹方案**生成
`src/content/posts/<文件名>/index.md`，顶部 frontmatter 格式如下：

```yaml
---
title: 文章标题
published: 2026-09-25
description: 文章摘要，用于列表页展示和 SEO 描述
image: './cover.png'      # 封面图，相对当前文章所在文件夹
tags: [标签一, 标签二]
category: 分类名
draft: false              # 为 true 时不会被构建进站点
lang: ''                  # 仅当文章语言与站点语言不同时才填
---
```

一篇文章一个文件夹，配图（封面 + 插图）就近放在同一层：

```
src/content/posts/
└── hello-world/
    ├── index.md      ← 正文
    ├── cover.png     ← 封面
    └── photo-1.png   ← 正文插图
```

图片跟着文章一起进 Git，不依赖图床；删文章时整个文件夹一起删，不留孤儿素材；
文件夹改名（等于改 URL）时配图一起搬走，相对路径不会失效。

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
5. **新增评论区** —— 用 giscus 接入 GitHub Discussions，配置项收在 `commentConfig`。
   组件是 `src/components/misc/Comments.astro`，但 iframe 的加载逻辑写在
   `src/layouts/Layout.astro`：本站用 Swup 做无刷新跳转且只替换 `<main>`，逻辑放在
   组件里会被重复执行、且从首页跳到文章页时不会注册，放 Layout 才整站只注册一次。
6. **移植 [Mizuki](https://github.com/LyraVoid/Mizuki) 的一组功能** ——
   看板娘、右侧栏（站点统计 / 日历 / 分类）、顶栏 Others 下拉菜单
   及其 4 个特色页面。移植时做了这些适配：
   - 所有内部链接一律走 `utils/url-utils.ts` 的 `url()`，保证部署在 `/fuwari/`
     子路径下不会 404（看板娘的 iframe 地址、模型路径、日历数据接口都做了处理）
   - i18n 改成「**英文兜底**」：语言文件只写自己有的键，缺的自动回退英文，
     这样以后加文案键不必再改 10 个语言文件
   - Mizuki 用的是 Tailwind v4，本站是 v3，相关组件的样式都改写成了 v3 写法
   - 看板娘用 iframe 隔离，并且放在 Swup 替换容器之外，跳页不会重新加载模型
   - 两个播放器 UI（悬浮 / 侧栏）通过 `.svelte.ts` 里的共享 store 保持同步
7. **整体版式按 [mizuki.mysqil.com](https://mizuki.mysqil.com/) 重排** ——
   页面宽度、栅格断点、横幅波浪、透明导航、首页分类筛选条、文章卡片、侧栏卡片
   逐项对照参考站调整。几个值得记下来的点：
   - **Tailwind 断点不一样**：Mizuki 用 v4 且改写了断点（`lg` = 1280px、`xl` = 1920px），
     而 v3 默认 `lg` = 1024px、`xl` = 1280px。所以移植时要把 Mizuki 的 `lg:` 写成
     `xl:`、`xl:` 写成 `2xl:`，不能照抄
   - **Tailwind 扫不到拼出来的类名**：栅格列定义必须写成完整字面量。
     写成 `md:grid-cols-[${w}_minmax(0,1fr)]` 这种运行时拼接，Tailwind 扫描阶段
     根本看不到，规则不会生成，三栏宽度会静默失效（退化成按内容自适应）
   - **Astro 不转义组件 prop 里的换行**：给组件传多行字符串会报
     `Unterminated string literal`，所以 `class` 这类 prop 必须写成一行
     （普通 HTML 元素上的多行 class 没这个问题）
   - 目录从「右侧浮动栏」改成「左侧栏卡片」：90rem 三栏之后两边已经塞不下
     第四条栏；`#toc` 仍是 Swup 的替换容器，只是搬进了卡片内部
   - 顺手修掉了两个原有的隐性问题：`ImageWrapper.astro` 里
     `import.meta.glob("../../**")` 会把 `src/styles/*.css` 也吸进依赖图导致
     构建偶发失败（改成显式 import + 限制 glob 只匹配图片）；
     以及小屏下 grid 的 `auto` 轨道被内容撑宽导致右侧被裁

---

## 十、参考

- Fuwari 主题：<https://github.com/saicaca/fuwari>
- Mizuki 主题（看板娘 / 右侧栏 / Others 菜单的移植来源）：<https://github.com/LyraVoid/Mizuki>
- oh-my-live2d（看板娘渲染库）：<https://github.com/hacxy/oh-my-live2d>
- Astro 文档：<https://docs.astro.build>
- Expressive Code 文档：<https://expressive-code.com>
- Pagefind 文档：<https://pagefind.app>
- 本项目源码：<https://github.com/xieluyang912/fuwari>

## 许可

主题部分遵循 [MIT License](LICENSE)。文章内容采用
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。
