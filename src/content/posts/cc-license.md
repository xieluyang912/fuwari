---
title: 博客更新日志：给页脚加上 CC 许可声明
published: 2026-09-27
description: '页脚多了一行 CC BY-NC 4.0 声明 —— 协议怎么选、代码写在哪、以及暗色模式下图标看不见的两个坑'
image: 'img\girl_art_anime_1313052_1280x720.jpg'
tags: [网站维护, 版权]
category: '网站维护'
draft: false 
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/qq-234259867-blue?logo=qq)
![Static Badge](https://img.shields.io/badge/github-xieluyang912-orange?logo=github)
![Static Badge](https://img.shields.io/badge/pnpm-%3E%3D9-green?logo=pnpm)
![Static Badge](https://img.shields.io/badge/nodedotjs-%3E%3D20-red?logo=nodedotjs)
![Static Badge](https://img.shields.io/badge/%E6%94%AF%E6%8C%81%E5%BA%93-astro-yellow?logo=astro)
![Static Badge](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-CC%20BY--NC%204.0-lightgrey)

</div>

页脚现在多了一行版权声明：本站内容采用 **CC BY-NC 4.0** 协议授权，后面跟着三个官方图标。

这篇文章记录三件事：为什么选这个协议、代码写在哪个文件、以及实现时踩到的两个坑。

# 声明长什么样

页脚最下面那行就是，结构是标准的 CC 署名格式：

> **xieluyang' blog** © 2026 by **xieluayng** is licensed under **Creative Commons Attribution-NonCommercial 4.0 International** [cc] [by] [nc]

这是 Creative Commons 官方推荐的排版方式，由五段组成：

| 部分 | 内容 | 作用 |
|:---|:---|:---|
| 作品名 | xieluyang' blog | 哪件作品被授权 |
| 年份 | 2026 | 版权起始年份 |
| 作者 | xieluayng | 版权归谁 |
| 协议名 | CC BY-NC 4.0 | 用哪个协议 |
| 协议图标 | cc / by / nc | 协议条款的可视化缩写 |

# 为什么是 CC BY-NC 4.0

Creative Commons 的协议是「模块拼装」出来的，四个模块两两组合，得到六种常用协议。本站选的这两个模块是：

| 缩写 | 全称 | 含义 | 本站 |
|:---|:---|:---|:---|
| **BY** | Attribution | 转载必须署名原作者 | ✅ 保留 |
| **NC** | NonCommercial | 不得用于商业用途 | ✅ 保留 |
| SA | ShareAlike | 衍生作品必须用同样的协议 | ❌ 未选 |
| ND | NoDerivatives | 不允许修改后发布 | ❌ 未选 |

另外两个模块没选，是有意的：

- **没选 SA**：SA 要求「你改了再发，也得用 CC BY-NC 4.0」。听起来很美好，但实际会造成协议传染 —— 别人引一段代码进自己的项目，可能整套项目都被要求跟着换协议。对技术博客来说太麻烦。
- **没选 ND**：ND 禁止修改。但博客文章被摘录、被翻译、被节选，绝大多数情况下是合理的引用行为，一刀切禁掉反而拦住了正常的传播。

所以 **BY-NC** 这个组合的含义可以一句话概括：

> 欢迎转载和引用，署名就行，但别拿去做生意。

## 它管不着什么

有两点必须说清楚，否则这行声明容易给人错误的预期：

:::warning[CC 协议不覆盖代码]
文章里的代码片段，严格来说不属于「文学艺术作品」，CC 协议对它并不是最合适的授权工具。正经做法是代码用 MIT 或 Apache 之类的**软件协议**单独声明 —— 本站代码本来就是从 [Fuwari](https://github.com/saicaca/fuwari)（MIT）改来的，沿用原协议即可。

页脚这行声明，主要覆盖的是**文章正文**。
:::

:::note[NC 只约束别人，不约束自己]
「非商业性使用」限制的是**被授权方**。也就是说：别人不能拿本站内容去卖钱，但我自己保留一切权利 —— 想出书、想接广告、想授权给商业机构，都不受这行声明影响。

版权始终在自己手里，CC 协议是「预先给出的许可」，不是「放弃版权」。
:::

# 代码写在哪

全部改动集中在一个文件：[`src/components/Footer.astro`](https://github.com/xieluyang912/fuwari/blob/main/src/components/Footer.astro) 的第 21–30 行，也就是原来 "Powered by Astro & Fuwari" 那行的**下面**、同一个圆角容器**内部**。

新增的是一个和上面那行同样式的 `<div>`：

```astro
<div class="transition text-50 text-sm text-center mt-2">
    <a class="transition link text-[var(--primary)] font-medium" target="_blank"
       href="https://xieluyang912.github.io/fuwari/">xieluyang' blog</a>
    &copy; {currentYear} by
    <a class="transition link text-[var(--primary)] font-medium" target="_blank"
       href="https://github.com/xieluyang912">xieluayng</a>
    is licensed under
    <a class="transition link text-[var(--primary)] font-medium" target="_blank"
       href="https://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International</a>
    <img class="dark:invert" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="...">
    <img class="dark:invert" src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="...">
    <img class="dark:invert" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" style="...">
</div>
```

几个设计上的选择：

- **类名照抄上面那一行**（`text-50 text-sm text-center`），视觉上两行才是同一套语言，字号颜色自动跟着主题变量走。
- **`mt-2`** 拉开和 "Powered by" 的间距，否则两行贴在一起像一句话。
- **年份用 `{currentYear}` 而不是写死 `2026`**：文件顶部本来就有一行 `const currentYear = new Date().getFullYear()`，上面版权行也用它。跟着用，以后不用每年手动改。

:::note[关于 id="license-year"]
初版我给年份 span 加了个 `id="license-year"`，想的是以后用 JS 更新。但翻了一遍源码，全站**没有任何脚本**引用它 —— 上面那行的 `id="copyright-year"` 同样是个没人用的空壳，年份其实是构建时就算好的。

既然是静态构建，直接写 `{currentYear}` 就够了，多出来的 id 只是噪音，已删。
:::

# 两个必须处理的细节

直接照抄官方给的 HTML 片段，会坏在两点上：

## 1. 暗色模式下图标会消失

`mirrors.creativecommons.org` 上的三个图标是**纯黑色**的 SVG。

本站有暗色主题，页脚在暗色下背景接近黑 —— 黑图标放在黑底上，等于没有。这不是「有点淡」，是彻底看不见。

解决办法是 Tailwind 的 `invert` 工具类，配合本站的暗色变体：

```html
<img class="dark:invert" src="...cc.svg" ...>
```

`dark:invert` 只在 `<html>` 挂上 `dark` 类时生效，把黑色反成白色。浅色模式下原样不动。

## 2. 图标会比文字低一截

官方片段只给了 `max-width` 和 `max-height`：

```html
style="max-width: 1em;max-height:1em;margin-left: .2em;"
```

`<img>` 默认是 `display: inline`，参与文字基线对齐 —— 图标的**底边**会对齐到文字基线，视觉上就是整体往下沉了一截，和旁边的字不在一条线上。

补两个属性即可：

```html
display:inline-block; vertical-align:middle;
```

:::warning[这两个坑不止 CC 图标会遇到]
**远程 SVG 图标 + 有暗色主题 + 行内跟随文字** —— 这个组合都会翻车。以后往正文或页脚塞任何外部图标，先检查这两点。
:::

# 图标从哪来

三个图标走的是 Creative Commons 官方的 presskit 镜像，这是 CC 官方提供的标准素材地址：

```
https://mirrors.creativecommons.org/presskit/icons/cc.svg   # CC 标志
https://mirrors.creativecommons.org/presskit/icons/by.svg   # 署名
https://mirrors.creativecommons.org/presskit/icons/nc.svg   # 非商业
```

用哪个协议就挂哪几个图标。比如选了 BY-SA，就把 `nc.svg` 换成 `sa.svg`；选了 CC0，只挂 `cc.svg` 和 `zero.svg`。

另外推荐在页面里也放上协议全文的链接（就是那行 "Creative Commons Attribution-NonCommercial 4.0 International" 上的超链接），指向 `https://creativecommons.org/licenses/by-nc/4.0/`。CC 官方建议**图标 + 协议名 + 链接**三者齐全，只放图标容易被误解成别的协议。

:::note[图标是远程加载的]
和[徽章那篇](/posts/badge)里说的一样：这些 SVG 是**访客浏览器直接向 mirrors.creativecommons.org 请求**的，构建时不会下载。

好处是离线也能构建成功；代价是网络不通时那三个位置会空着 —— 因为 `alt=""`，连替代文字都没有。这是刻意的：图标只是协议名的视觉补充，旁边的文字已经把授权说清楚了，图标缺失不影响法律效力。
:::

# 以后要改什么

| 想改 | 改哪里 |
|:---|:---|
| 换协议 | 改协议名文字、链接地址、图标文件名（三处都要动） |
| 改署名 | 改 "xieluayng" 那几个字和它指向的链接 |
| 改年份 | **不用改**，`{currentYear}` 每年自动更新 |
| 改博客名 | 改 "xieluyang' blog" 和它指向的链接 |
| 整行删掉 | 删 `Footer.astro` 第 21–30 行那个 `<div>`，其余不动 |

:::warning[换协议时最容易漏的一处]
三个图标是**手写的三个 `<img>`**，不是循环生成的。从 BY-NC 换成 BY-SA 时，很容易只改协议名和链接、忘了把 `nc.svg` 换成 `sa.svg` —— 结果声明写的是 SA，图标画的是 NC，两者矛盾。

协议名、链接、图标，**三处必须一致**。
:::

# 这行声明没能覆盖的

写在这里免得以后自己忘了：

- **代码片段**：如前所述，CC 对代码不是合适的工具，本站代码实际跟着上游 Fuwari 走 MIT。
- **封面图和正文配图**：本站图片多来自 Pexels 等免费图库。**图库图片的版权不在我手里**，我无权把它们纳入 CC BY-NC 授权。如果将来有人完整转载文章，图片的授权问题需要单独说明。
- **访客评论**：评论存在 GitHub Discussions，版权归评论者本人。

所以更准确的说法是：**这行声明覆盖的是「除特别注明外」的原创文章正文**。

# 加许可声明的检查清单

- [ ] 协议选好了：BY 必选，NC / SA / ND 按需组合
- [ ] 协议名、链接地址、图标文件**三者一致**
- [ ] 图标加了 `dark:invert`（有暗色主题的话）
- [ ] 图标加了 `display:inline-block; vertical-align:middle;`
- [ ] 年份用 `{currentYear}`，别写死
- [ ] 署名和链接指向的是自己
- [ ] 想清楚这行声明的**边界**：代码？配图？评论？

# 最后

改完之后我重新构建了一遍，确认 `example.com` 这个占位地址在产物里已经归零、三个图标和协议链接都正常出现在页面上。

有点讽刺的是，写这篇文章的过程本身就在提醒自己：**许可声明不是加一行字就完事**，它逼着人把「哪些东西是我的、哪些不是我的」想清楚。配图那一块就是我这次才意识到的漏洞，以后有空再单独处理。
