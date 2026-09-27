---
title: 博客更新日志：照着 mizuki.mysqil.com 把整站版式重排了一遍
published: 2026-09-27
description: '从参考站抠出栅格、波浪、卡片结构，逐项对齐；以及过程中踩到的几个静默失败'
image: 'img\girl_backpack_road_1160862_1280x720.jpg'
tags: [网站维护, Astro, 前端]
category: '网站维护'
draft: false
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/%E7%B1%BB%E5%9E%8B-%E7%AC%94%E8%AE%B0-blue)
![Static Badge](https://img.shields.io/badge/%E5%BD%92%E5%B1%9E-%E7%BD%91%E7%AB%99%E7%BB%B4%E6%8A%A4-orange)
![Static Badge](https://img.shields.io/badge/%E5%8F%82%E8%80%83%E7%AB%99-mizuki.mysqil.com-green)
![Static Badge](https://img.shields.io/badge/%E6%A1%86%E6%9E%B6-astro-purple?logo=astro)
![Static Badge](https://img.shields.io/badge/%E6%A0%B7%E5%BC%8F-tailwind%20v3-38bdf8?logo=tailwindcss)

</div>

之前给博客加了看板娘、右侧栏统计、日历、音乐播放器这些功能，功能是齐了，但**版式还是 Fuwari 原来的样子**——页面 75rem 宽、两栏、导航栏是一张不透明的卡片、文章卡片的信息挤在底部一行小字里。

这次的目标很直接：照着 <https://mizuki.mysqil.com/> 把整站的排版重做一遍。参考站是 [Mizuki](https://github.com/LyraVoid/Mizuki) 主题的官方演示站，和本站同源（都从 Fuwari 长出来），所以「抄」起来阻力最小。

本文记录改了哪些东西、怎么确定改对了，以及几个**不报错但静默失效**的坑——那几个才是真正花时间的部分。

# 一、先学会「量」，再动手改

照着别人的站改版式，最大的风险是「我觉得像了」。肉眼看两张截图很容易自我欺骗，所以这次全程靠数字说话，分三步。

## 1. 把参考站截下来

用无头 Edge 直接截图，桌面端、长图、深浅色各来一张：

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless --disable-gpu --hide-scrollbars `
  --window-size=1600,1000 --virtual-time-budget=20000 `
  --screenshot=ref.png "https://mizuki.mysqil.com/"
```

`--virtual-time-budget` 是给页面留出执行 JS 的时间，不然截到的是骨架。

## 2. 从构建产物里抠数值

截图只能看出「大概多宽」，具体多少 rem 得看 CSS。参考站的样式表地址就写在 HTML 里：

```powershell
# 从首页 HTML 里列出所有 stylesheet
[regex]::Matches($html, '<link rel="stylesheet" href="([^"]+)"')
```

拉下 `variables.css` 一看，颜色变量和本站**几乎一模一样**——因为两边的 `variables.styl` 同源。真正的差异全在布局变量上：

| 变量 | 参考站 | 本站（改之前） |
|:---|:---|:---|
| `--page-width` | `90rem` | `75rem` |
| 单侧栏宽度 | `17.5rem` | `17.5rem`（但只有一栏） |
| 栅格列数 | 1 / 2 / 3 栏 | 1 / 2 栏 |

这一步很关键：**如果颜色本来就一致，那"不像"就一定出在结构和尺寸上**，不用去瞎调配色。

## 3. 写个探针页量真实宽度

CSS 里写了 `17.5rem` 不等于页面上真的是 280px——中间可能被 grid 轨道、`max-w`、flex 收缩改掉。所以做了一个临时页面，把各容器的 `getBoundingClientRect()` 读出来直接画在页面上，再截图：

```js
const w = (sel) => {
  const el = document.querySelector(sel);
  const r = el.getBoundingClientRect();
  return `${Math.round(r.width)} @x${Math.round(r.left)}`;
};
probe.textContent = [
  `grid=${w("#main-grid")}`,
  `sidebar=${w("#sidebar")}`,
  `main=${w("main")}`,
  `rightSidebar=${w("#right-sidebar")}`,
].join("\n");
```

:::note[这一步救了我一次]
第一次量出来的结果是 `sidebar=171 / main=845 / rightSidebar=360`，而预期是 `280 / 816 / 280`。三栏宽度**全错**，但页面看上去"还行"，肉眼根本发现不了。原因见下面第三节的第一个坑。
:::

# 二、改了哪些地方

## 页面栅格：75rem → 90rem，三栏在 1280px 出现

```diff
- grid-cols-[17.5rem_auto]                    /* 一直都是两栏 */
+ grid-cols-1
+ md:grid-cols-[17.5rem_minmax(0,1fr)]
+ xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]
```

列数变化和参考站一致：

| 视口宽度 | 布局 |
|:---|:---|
| < 768px | 单栏：正文 → 左栏 → 右栏 → 页脚 |
| ≥ 768px | 两栏：左栏 \| 正文 |
| ≥ 1280px | 三栏：左栏 \| 正文 \| 右栏 |

两个细节：

1. **正文列写成 `minmax(0, 1fr)` 而不是 `auto`。** `auto` 轨道的下限是"内容的 min-content 宽度"，小屏上它经常比屏幕还宽，会把整个网格顶出去、右侧内容被裁掉。
2. **跨列的元素要加 `min-w-0`。** 右侧栏在窄屏是 `col-span-2` 横跨整行，不加 `min-w-0` 的话它会按内容最小宽度去撑轨道。

## 横幅底部那条波浪

这是参考站最有辨识度的东西，实现方式比想象的朴素——**不是 mask 也不是 clip-path，就是一条 SVG 路径叠了 4 次**：

```html
<svg viewBox="0 20 150 32" preserveAspectRatio="none">
  <defs>
    <path id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v48h-352z" />
  </defs>
  <use href="#gentle-wave" y="0" class="opacity-25" style="animation-delay:-2s; animation-duration:7s" />
  <use href="#gentle-wave" y="3" class="opacity-50" style="animation-delay:-3s; animation-duration:10s" />
  <use href="#gentle-wave" y="5" class="opacity-75" style="animation-delay:-4s; animation-duration:13s" />
  <use href="#gentle-wave" y="7" class="opacity-100" style="animation-delay:-5s; animation-duration:20s" />
</svg>
```

```css
.wave-layer {
  fill: var(--page-bg);            /* 关键：波浪的颜色就是页面底色 */
  animation: wave-move 25s cubic-bezier(.5,.5,.45,.5) infinite;
}
@keyframes wave-move {
  from { transform: translate(-90px, 0); }
  to   { transform: translate(85px, 0); }
}
```

三个要点：

- **`fill` 用 `var(--page-bg)`**，看起来就像页面背景从下面漫上来把横幅"切"掉了。换主题色、切深浅模式时波浪会自动跟着变色，一行 JS 都不用写。
- **`preserveAspectRatio="none"` 必须有**，否则波浪不会随宽度拉伸，窄屏上会缩成一团。
- **4 层的差异只有 y 偏移（0/3/5/7）、不透明度（25/50/75/100）和时长（7/10/13/20 秒）**。时长互质、延迟取负值，波纹就不会同步，形成"水在错位流动"的视差感。

## 首页横幅文字：不给整幅图加遮罩

参考站的横幅正中有站点大标题，但它**没有铺一层黑色遮罩**（那样会把图压暗）。可读性全靠文字自己的阴影：

```css
.banner-title    { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); }
.banner-subtitle { text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6); }
```

副标题在配置里，不想要就把两个字段都留空：

```ts
banner: {
  homeText: {
    title: "Xieluyang 的小屋",
    subtitle: "记录一些值得记下来的东西",
  },
}
```

## 导航栏：顶部透明，滚动后毛玻璃

改之前它是一张不透明卡片，`!rounded-t-none` 贴着屏幕顶端。改成和参考站一致的两态：

```css
/* 默认：不透明卡片 */
#navbar > .navbar-bar {
  background-color: var(--card-bg);
  border-radius: var(--radius-large);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ① 顶部：完全透明，让横幅透出来 */
#navbar[data-has-banner="true"]:not(.scrolled) > .navbar-bar {
  background-color: transparent;
  box-shadow: none;
  border-color: transparent;
}

/* ② 滚动后：毛玻璃 */
#navbar[data-has-banner="true"].scrolled > .navbar-bar {
  background-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

`.scrolled` 由一段十几行的脚本控制：

```js
const SCROLL_THRESHOLD = 50;
const syncScrolled = () => {
  const top = window.scrollY || document.documentElement.scrollTop || 0;
  navbarEl.classList.toggle("scrolled", top > SCROLL_THRESHOLD);
};
window.addEventListener("scroll", syncScrolled, { passive: true });
syncScrolled();   // 首屏可能是带着滚动位置刷新的，先同步一次
```

阈值取 50px：一点就变卡片会显得神经质，太大又迟钝。

## 首页顶部的分类筛选条

参考站首页第一屏是一条独立的卡片：`🏠 | 归档 8 | 各分类`。做成 `CategoryBar.astro`，几个细节：

- pill 有三种状态，用属性而不是 class 控制：默认 / `:hover` / `[data-active]`（当前分类填充主题色）
- 分类多的时候可以横向滚动，**滚轮直接转成横向滚动**，不用按 shift
- 两侧有 2.5rem 的渐隐遮罩，滚到头/尾会消失，提示"还有更多"
- 脚本按 URL 里的 `?category=` 高亮，并挂到 Swup 的 `page:view` 上——本站是无刷新跳转，换页后必须重新按当前地址算一次

## 文章卡片：把"底部两行小字"换成图标小块

参考站的卡片信息层级很清楚：标题 → 元信息（日期 / 分类 / 字数，每项都是"图标小块 + 文字"）→ 摘要 → 标签 chip 行。

改之前，字数和阅读时长是卡片底部一行灰色小字：

```html
<div class="text-sm text-black/30">1736 words | 9 minutes</div>
```

现在并进 `PostMeta`，和日期、分类排成一行：

```html
<div class="flex items-center">
  <div class="meta-icon">
    <Icon name="material-symbols:article-outline-rounded" class="text-xl" />
  </div>
  <span class="text-50 text-sm font-medium">1736 words</span>
</div>
```

标签单独排一行 chip（这一行 Fuwari 原本没有）：

```html
<div class="flex flex-wrap gap-2 mt-2">
  <a href="..." class="btn-regular h-6 text-xs px-2 rounded-lg active:scale-95 group/tag">
    <span class="transition-transform group-hover/tag:translate-x-0.5"># Markdown</span>
  </a>
</div>
```

## 左侧栏：加公告卡，目录搬进来

参考站左栏的顺序是：个人资料 → 公告 → 标签 → 目录。

**公告卡**是新加的，可以关掉，关掉后记在 `localStorage` 里：

```ts
export const announcementConfig: AnnouncementConfig = {
  enable: true,
  title: "公告",
  content: "欢迎来到我的小站～ 这里主要记录一些学习笔记和折腾过程。",
  link: { text: "了解更多", url: "/about/", external: false },
};
```

**目录**从"右侧浮动栏"改成"左栏卡片"，这是迫不得已：整页 90rem + 左右各 17.5rem 侧栏之后，两边已经塞不下第四条浮动栏了（算一下：`90 + 2×18 = 126rem ≈ 2016px` 才够）。参考站本来就是侧栏目录，正好一致。

技术上有个坑：目录的 `#toc` 是 Swup 的替换容器之一，而侧栏**不在**替换容器里。最后是这样解决的——卡片外框常驻，`#toc` 放在里面，靠 CSS 的 `:has()` 决定显不显示：

```css
/* 默认不显示，只有 #toc 里真的渲染出了 <table-of-contents>（也就是文章页）才显示 */
.toc-widget-card { display: none; }
.toc-widget-card:has(table-of-contents) { display: block; }
```

用 `:has()` 而不是在服务端判断，是因为侧栏不参与 Swup 替换——服务端算出来的显隐状态在跳页后不会更新。

## 卡片补一条极淡的描边

深色模式下卡片底色只比页面底色亮一档，光靠底色分层不够明显：

```css
.enable-card-border .card-base {
  border: 1px solid var(--line-divider);      /* rgba(255,255,255,.08) */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

# 三、五个坑（都不报错，只是静默失效）

这一节是本文的重点。下面每一条都是"构建成功、页面能看、但效果是错的"。

## 1. Tailwind 扫不到拼出来的类名 ⚠️ 最隐蔽

我图省事，把侧栏宽度抽成常量再插值：

```js
const sidebarCol = `${SIDEBAR_WIDTH}rem`;
const mainGridClass = [
  `md:grid-cols-[${sidebarCol}_minmax(0,1fr)]`,
  `xl:grid-cols-[${sidebarCol}_minmax(0,1fr)_${sidebarCol}]`,
].join(" ");
```

**Tailwind 是靠"扫描源码文本"来生成 CSS 的。** 源码里根本不存在 `xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]` 这个字符串，只有一堆 `${}`，所以这条规则压根不会生成。

后果不是报错，而是 `grid-template-columns` 完全没生效，三个块退化成"按内容自适应"，实测宽度变成 `171 / 845 / 360`。

修正很简单——写死字面量：

```js
const mainGridClass = [
  "grid-cols-1",
  "md:grid-cols-[17.5rem_minmax(0,1fr)]",
  sidebarConfig.enable ? "xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]" : "",
].join(" ");
```

:::warning[这类坑的共同点]
**没有报错、没有警告、构建成功、页面"看起来还行"。** 只有用探针量出 `171/845/360` 才暴露。所以别省那一次测量。
:::

## 2. Astro 不转义组件 prop 里的换行

给组件传多行字符串会直接编译失败：

```astro
<!-- ❌ 报 Unterminated string literal -->
<RightSideBar
    class="col-span-2 col-start-1 row-start-3 mb-4
           lg:row-start-2 lg:col-span-2"
/>
```

原因是 Astro 把"组件 prop 的字符串"原样塞进 JS 字符串字面量，且**不转义里面的换行符**。普通 HTML 元素上的多行 `class` 没这个问题（那是当 HTML 直接输出的）。

修法：算好再传，或者写成一行。

```astro
<!-- ✅ -->
<RightSideBar class={rightSideBarClass} />
```

## 3. Tailwind v3 和 v4 的断点不是一回事

参考站用 Tailwind v4，而且它的配置**改写了断点**：

| 前缀 | Tailwind v3 默认 | 参考站（v4 + 自定义） |
|:---|:---|:---|
| `md` | 768px | 768px |
| `lg` | **1024px** | **1280px** |
| `xl` | **1280px** | **1920px** |

所以**不能照抄 `lg:` 和 `xl:`**。移植时的映射关系是：

- 参考站的 `md:` → 本站 `md:`
- 参考站的 `lg:` → 本站 `xl:`
- 参考站的 `xl:` → 本站 `2xl:`

一开始我差点去改 `tailwind.config.cjs` 的 `screens` 好让前缀一致，但那样会顺手改掉全站所有既有 `lg:` 的含义，风险太大，最后还是老老实实逐条换算。

## 4. 无头浏览器不推进 CSS transition（把我骗了一次）

验证毛玻璃效果时，我用探针读出这样的结果：

```
② 滚动 120px 后
  class            = "z-50 onload-animation group scrolled"   ← 类加上了
  background-color = rgba(0, 0, 0, 0)                          ← 却是透明的？
  backdrop-filter  = blur(0px)                                 ← 0 像素？
```

看起来像"类加上了但样式没生效"。实际原因是：**无头浏览器里 CSS transition 不会推进**，`getComputedStyle` 返回的是过渡的**起始值**。`blur(0px)` 正是从 `none` 过渡到 `blur(20px)` 的第 0 帧。

验证方法是把过渡关掉再读：

```js
bar.style.transition = "none";
nav.classList.add("scrolled");
void bar.offsetHeight;        // 强制重排，让新样式立即生效
getComputedStyle(bar);        // 这时候读到的才是最终值
```

```
② 手动加 .scrolled（已禁用过渡）
  background-color = rgba(255, 255, 255, 0.55)      ✓
  backdrop-filter  = blur(20px)                     ✓
  border-color     = rgba(255, 255, 255, 0.55)      ✓
  box-shadow       = rgba(0,0,0,0.1) 0px 4px 16px   ✓
```

样式本来就是对的，是测量方法有问题。

## 5. 一个把 CSS 偷偷吞进依赖图的 glob

这个坑之前就埋着，这次重新构建时踩到了：`ImageWrapper.astro` 里为了动态加载图片写了

```js
const files = import.meta.glob("../../**", { import: "default" });
```

`../../**` 等于 `src/**`，**把 `src` 下所有文件都塞进了 Vite 的依赖图**，包括 `src/styles/*.css`。副作用是全局样式"顺便"生效了——但加载顺序不可控，Tailwind 处理 `@apply` 时偶尔会报 `The 'link' class does not exist`，构建随机失败（大约 5 次里挂 1 次）。

修法两步：

1. 把这个 glob 限定成图片后缀，它本来也只该管图片
2. 全局样式改成在 `Layout.astro` 里显式 `import`，顺序写死（变量 → 公共类 → 各样式文件）

```ts
import "../styles/variables.styl";
import "../styles/main.css";
import "../styles/markdown.css";
// ...
```

顺带还把跨文件的 `@apply` 展开了（`markdown.css` 里 `@apply link` 依赖 `main.css` 先处理完），彻底消除顺序依赖。

# 四、怎么确认改对了

光看"我觉得像了"不算数。这次的验收手段有三个：

1. **探针量数值** —— 关键容器宽高写进页面再截图，和参考站对比。最终 `sidebar=280 / main=816 / rightSidebar=280`，整页 1440px，和参考站完全一致。
2. **无头截图对比** —— 1600×1000 视口下逐区块比对，深浅色各来一遍（`--blink-settings=preferredColorScheme=1` 可以强制浅色）。
3. **`astro check` + `biome check`** —— 保证没引入新的类型错误和格式问题。（`astro check` 还剩 2 个错误，都是改动之前就存在的：`Navbar.astro` 里 Svelte 组件的 `client:only` 类型、`archive.astro` 里的 `PostForList` 类型。）

# 五、结果

对着参考站逐项核对，现在一致的部分：

- 整页 90rem、单侧栏 17.5rem、断点 768 / 1280
- 横幅底部的四层视差波浪 + 首页居中大标题（靠文字阴影保证可读性）
- 导航栏顶部透明、滚动 50px 后变毛玻璃（白 55% + 20px 模糊）
- 首页分类筛选条（可横向滚动 + 当前分类高亮）
- 文章卡片：标题竖线、图标小块式元信息、摘要、`# 标签` chip 行、右侧封面
- 左侧栏顺序：个人资料 → 公告 → 标签 → 目录
- 卡片统一的极淡描边与投影

功能上一点没丢：目录、站点统计、日历、音乐播放器、看板娘、Others 菜单都还在，只是换了位置和长相。

# 六、给以后的自己

1. **改版式之前先量，改完再量一次。** 可视化对比会骗人，数字不会。
2. **Tailwind 的类名必须是字面量。** 任何 `${}` 插值都当成"这条规则不存在"来预期。
3. **Astro 组件 prop 不要写多行字符串。**
4. **v3 和 v4 的断点前缀含义不同，跨版本抄代码一定先对表。**
5. **无头浏览器里读 transition 属性会读到起始值**，验证样式要么禁用过渡，要么读规则的最终值。
6. **`import.meta.glob` 的通配符要收窄。** `../../**` 这种写法会把整个 `src` 拖进依赖图，副作用难以预料。

# 参考

- 参考站：<https://mizuki.mysqil.com/>
- Mizuki 主题源码：<https://github.com/LyraVoid/Mizuki>
- Fuwari 主题：<https://github.com/saicaca/fuwari>
- Tailwind 断点文档：<https://tailwindcss.com/docs/responsive-design>
