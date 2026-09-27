---
title: 文章顶部的徽章标签怎么用
published: 2026-09-27
description: 'badge-row + shields.io 静态徽章：地址怎么拼、中文怎么转义、颜色怎么选，以及几个踩过的坑'
image: 'img\TempDragFile_20260926_003024(1).png'
tags: [网站维护, Markdown]
category: '网站维护'
draft: false
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/%E7%B1%BB%E5%9E%8B-%E7%AC%94%E8%AE%B0-blue)
![Static Badge](https://img.shields.io/badge/%E4%B8%BB%E9%A2%98-shields.io-green?logo=shieldsdotio)
![Static Badge](https://img.shields.io/badge/%E5%BD%92%E5%B1%9E-%E7%BD%91%E7%AB%99%E7%BB%B4%E6%8A%A4-orange)
![Static Badge](https://img.shields.io/badge/markdown-%E9%9D%99%E6%80%81%E6%B8%B2%E6%9F%93-blue?logo=markdown)

</div>

上面这一排就是这篇笔记要讲的东西。它出现在本站大多数文章的正文最前面，作用是在读者还没开始读之前，先把「讲的是什么、属于哪个方向、用什么做的」交代完。

以后给新文章加一排，照抄下面的模板改文字就行。本文记录它的三个组成部分、地址怎么拼、本站的配色约定，以及几个踩过的坑。

# 其实是三样东西拼起来的

一排徽章由三个部件组成，缺一个都不成立：

| 部件 | 位置 | 作用 |
|:---|:---|:---|
| 徽章图片 | `https://img.shields.io/badge/...` | 真正的「标签」，由 shields.io 按 URL 现场生成 SVG |
| 容器 | Markdown 里的 `<div class="badge-row">` | 把这一排圈起来，交给下面的 CSS 排版 |
| 样式 | `src/layouts/Layout.astro` 的 `<style is:global>`（约 197–211 行） | 排成一行、放不下自动折行、清零图片外边距 |

:::note[为什么样式写在 Layout.astro 里]
Markdown 正文是构建时才拼进页面的，Astro 的组件级 scoped 样式管不到它，所以 `.badge-row` 的规则必须放在 `<style is:global>` 里。反过来说：**改那一小段会影响全站所有文章的徽章**，动手前先想清楚。
:::

# 最小可用示例

把下面这段贴进文章正文就能用：

```md
<div class="badge-row">

![Static Badge](https://img.shields.io/badge/qq-234259867-blue?logo=qq)
![Static Badge](https://img.shields.io/badge/github-xieluyang912-orange?logo=github)
![Static Badge](https://img.shields.io/badge/pnpm-%3E%3D9-green?logo=pnpm)

</div>
```

渲染出来是这样：

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/qq-234259867-blue?logo=qq)
![Static Badge](https://img.shields.io/badge/github-xieluyang912-orange?logo=github)
![Static Badge](https://img.shields.io/badge/pnpm-%3E%3D9-green?logo=pnpm)

</div>

# shields.io 的地址怎么拼

固定格式是三段，用 `-` 连接：

```
https://img.shields.io/badge/<标签>-<内容>-<颜色>
```

- **标签**（左半，可选）：这一枚在说什么，例如 `pnpm`、`项目`
- **内容**（右半）：具体值，例如 `>=9`、`大创`
- **颜色**：命名色或十六进制，控制右半的背景色

只有「内容 + 颜色」也合法，会渲染成单段徽章，例如 `https://img.shields.io/badge/just%20the%20message-8A2BE2`。

## 转义规则（最容易出错的地方）

因为 `-` 被用来分隔字段，所以文字里的特殊字符必须先转义：

| 想显示 | 要写成 | 说明 |
|:---|:---|:---|
| 空格 | `_` 或 `%20` | 两种都认，`%20` 更不容易和下面的规则打架 |
| 下划线 `_` | `__` | 单个 `_` 会被当成空格 |
| 连字符 `-` | `--` | **单个 `-` 是字段分隔符**，直接写会被拆开 |
| 中文 | 百分号编码 | 例如 `支持库` → `%E6%94%AF%E6%8C%81%E5%BA%93` |
| `#` | `%23` | 十六进制颜色必须这么写，否则会被当成页内锚点 |
| `%` | `%25` | 例如 `95%` → `95%25` |
| `/` | `%2F` | 路径里直接写 `/` 会被当成新的路径段 |

连字符这条最坑，看对比（上面是直接写，下面是转义后）：

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/claude-code-orange?logo=claude)
![Static Badge](https://img.shields.io/badge/claude--code-orange?logo=claude)

</div>

`claude-code-orange` 会被拆成「标签 claude + 内容 code + 颜色 orange」三段，想显示 `claude-code` 必须写成 `claude--code`。

## 可选参数

在地址后面用 `?` 接查询参数，多个用 `&` 连接：

| 参数 | 作用 | 例子 |
|:---|:---|:---|
| `style` | 徽章形状 | `?style=flat-square`（还有 `plastic`、`for-the-badge`、`social`，默认 `flat`） |
| `logo` | 左侧图标，填 simple-icons 的 slug | `?logo=astro` |
| `logoColor` | 图标颜色 | `?logoColor=white` |
| `labelColor` | 左半部分的背景色 | `?labelColor=grey` |
| `label` / `color` | 覆盖路径里写的标签 / 颜色 | `?label=healthiness` |
| `link` | 给左右两半分别挂链接，**只在 `<object>` 标签里生效**，`<img>` 无效 | —— |

想让徽章可以点击跳转，别指望 `link`，用 Markdown 链接把图片包起来即可：

```md
[![Static Badge](https://img.shields.io/badge/qq-234259867-blue?logo=qq)](https://qm.qq.com/q/xxxxxx)
```

# 本站的配色约定

颜色不是随便挑的，同一含义尽量用同一个颜色，翻文章时才有一致的观感：

| 颜色 | 本站用途 | 现有例子 |
|:---|:---|:---|
| `blue` | 身份、账号、归属 | `qq`、`github`、`steam`、`zotero`、`归属-网站维护` |
| `green` | 工具链、技术、版本 | `pnpm`、`nodedotjs`、`支持库-astro` |
| `orange` | 项目、主题、场景 | `项目-大创`、`场次-2026.09.26 苏州` |
| `red` | 关键值或强调 | `nodedotjs >=20`、`歌手-黄霄雲` |
| `yellow` | 不刺眼的点缀 | `counterstrike` |
| `lightgrey` | 草稿、占位、说明 | `状态-草稿` |

可用的颜色有两类：

- **shields 自带的命名色**：`brightgreen`、`green`、`yellow`、`yellowgreen`、`orange`、`red`、`blue`、`grey`、`lightgrey`
- **任意 CSS 颜色**：`purple`、`pink` 这类颜色名，或十六进制（注意 `#` 要写成 `%23`，例如 `%23ff69b4`）

:::warning[颜色名拼错不会报错]
写错颜色名时 shields 不会提示，而是**静默回退成默认的亮绿 `brightgreen`**。本站早期几排徽章里的「支持库-astro」写的是 `yello`（少了一个 w），渲染出来一直是绿色而不是黄色 —— 这次一并改成了 `yellow`。同理，`logo` 的 slug 写错也不报错，只是图标不显示。
:::

# 图标从哪来

`logo` 参数的值是 [simple-icons](https://simpleicons.org) 的 slug：打开官网点图标标题就能复制，或者直接查仓库里的 `slugs.md`。

不确定某个 slug 存不存在，可以先探活：

```
https://cdn.simpleicons.org/<slug>     # 200 = 有，404 = 没有
```

本站用到的几个：`qq`、`wechat`、`github`、`steam`、`zotero`、`applemusic`、`counterstrike`、`ea`、`500px`、`ubisoft`、`pnpm`、`nodedotjs`、`astro`、`markdown`、`pubmed`、`claude`、`deepseek`、`shieldsdotio`。

# 排版上的两个注意点

1. **同一段落里换行，中间不要空行。** Markdown 里连续几行属于同一个 `<p>`，`.badge-row > p` 才能把它们排成一行；中间插了空行就会被拆成多个 `<p>`，一个 `<p>` 占一行。
2. **`<div>` 标签那两行留空行没问题**，本站惯例是 `<div class="badge-row">` 后空一行、徽章写在一起、再空一行写 `</div>`。

至于为什么必须套 `badge-row`：prose 默认给图片上下各 2em 外边距，一排徽章直接写会被撑出很大的空隙；`badge-row` 把 margin 清零，改用 `gap` 统一控制行内与行间距，窗口变窄时自动折行。

# 中文一键转义

手抄百分号编码太容易错，直接用现成的函数：

```powershell
# PowerShell：得到 %E6%94%AF%E6%8C%81%E5%BA%93
[uri]::EscapeDataString('支持库')
```

```javascript
// Node / 浏览器控制台：同样得到 %E6%94%AF%E6%8C%81%E5%BA%93
encodeURIComponent('支持库')
```

两个函数都不会转义 `-`，所以内容里真的要写连字符时，仍然要自己补成 `--`。

# 加一排徽章的检查清单

- [ ] 先想清楚这一排要表达什么：身份？主题？版本？状态？
- [ ] 一行一枚徽章，中间不空行
- [ ] 中文和特殊字符都转义过了
- [ ] 颜色名是合法值（别写 `yello`）
- [ ] `logo` 的 slug 用 `cdn.simpleicons.org` 探过
- [ ] 整排包在 `<div class="badge-row">` 里

# 本站现有徽章一览

| 文件 | 徽章主题 | 数量 |
|:---|:---|:---|
| `src/content/posts/hello-world.md` | 联系方式 + 技术栈 | 9 |
| `src/content/posts/beiwanglu.md` | 联系方式 + 技术栈 + 常用软件 | 13 |
| `src/content/posts/giscus.md` | 联系方式 + 技术栈 | 9 |
| `src/content/posts/xmjs.md` | 联系方式 + 技术栈 + 常用软件 | 13 |
| `src/content/spec/about.md` | 联系方式 + 技术栈 + 摄影 / 游戏 | 11 |
| `src/content/posts/1.md` | 大创项目：学科、人群、技术路线 | 7 |
| `src/content/posts/2.md` | 大创项目：申报书用途、方法、文献库 | 6 |
| `src/content/posts/huangxiaoyun-live.md` | 演出信息：歌手、巡演、场次、曲目 | 5 |
| `src/content/posts/tuki.md` | 图库索引：数量、用途、状态 | 5 |

后四篇原来没有徽章，是 2026-09-27 按本文的约定补上的：学习类文章用「项目 / 学科 / 人群 / 技术」这类中性字段，生活类文章用「歌手 / 巡演 / 场次 / 曲目」，草稿统一挂一枚 `状态-草稿` 作提示。

# 几个坑速查

1. 单个 `-` 是字段分隔符，文字里的连字符要写 `--`
2. 颜色名拼错会静默变成亮绿，不报错
3. `logo` slug 拼错不报错，只是没有图标
4. 徽章是**访客浏览器直接向 `img.shields.io` 请求**的远程图片，构建时不会下载 —— 所以离线也能构建成功，但网络不通时页面上只剩 alt 文字
5. 图片 alt 统一写 `Static Badge`，和 shields 官方示例保持一致，方便一眼搜出全站所有徽章
