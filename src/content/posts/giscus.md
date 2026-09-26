---
title: 博客更新日志：接入 giscus 评论区
published: 2026-09-26
description: '文章底部现在有评论区了 —— 用 giscus 把评论存进 GitHub Discussions，顺便记录两个踩过的坑'
image: 'img\girl_art_anime_1313052_1280x720.jpg'
tags: [网站维护, giscus]
category: '网站维护'
draft: false 
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/qq-234259867-blue?logo=qq)
![Static Badge](https://img.shields.io/badge/wechat-xly15283272038-green?logo=wechat)
![Static Badge](https://img.shields.io/badge/gihub-xieluyang912-orange?logo=github)
![Static Badge](https://img.shields.io/badge/steam-xxllyy-red?logo=steam)
![Static Badge](https://img.shields.io/badge/pnpm-%3E%3D9-green?logo=pnpm)
![Static Badge](https://img.shields.io/badge/nodedotjs-%3E%3D20-red?logo=nodedotjs)
![Static Badge](https://img.shields.io/badge/deepseek-harness-blue?logo=deepseek)
![Static Badge](https://img.shields.io/badge/claude-code-orange?logo=claude)
![Static Badge](https://img.shields.io/badge/%E6%94%AF%E6%8C%81%E5%BA%93-astro-yello?logo=astro)

</div>

从今天起，每篇文章的底部都有了评论区。这一篇记录一下它是怎么接进来的、为什么这么选，以及中途踩到的两个坑。

# 评论存在哪里

评论区用的是 [giscus](https://giscus.app)，一个把 GitHub Discussions 变成评论框的开源组件。

它和常见的评论系统不太一样的地方在于**没有独立的服务器和数据库**：

- 你在评论区发的每一条，实际上都是仓库 `xieluyang912/fuwari` 里 Discussions 的一条回复
- 页面上只嵌入一个 iframe，评论数据全部存在 GitHub 上
- 因此不会出现「评论服务商跑路了，评论全没了」这种事 —— 数据跟着仓库走

代价是**评论需要用 GitHub 账号登录**。如果你没有 GitHub 账号，或者所在网络访问 GitHub 不稳定，那就没法评论了。这个取舍我选择了前者：数据掌握在自己手里，比多几个匿名评论更重要。

# 怎么评论

1. 滚动到文章底部（评论区在版权声明下面）
2. 点「使用 GitHub 登录」授权一次
3. 写下想说的话，提交

评论同时会出现在仓库的 Discussions 里，地址是 <https://github.com/xieluyang912/fuwari/discussions>，在那边也一样能回复。

# 为什么选 giscus

本站是纯静态站点 —— Astro 构建出一堆 HTML，托管在 GitHub Pages 上，构建完成之后没有任何服务端代码。这意味着：

- 带服务端的评论系统（云函数 + 数据库那一类）要多维护一套东西，还可能产生费用
- 自建服务还要操心备案、续费、被刷
- 而 giscus 只需要前端嵌一个 iframe，成本是零

:::note[分类上的一个小设计]
Discussions 里我建了一个 **Announcements** 类型的分类来存评论。这个类型只有管理员和 giscus 机器人能发起 discussion，访客只能回复、不能自己开新帖 —— 相当于从源头挡掉一部分垃圾内容。
:::

# 两个踩到的坑

## 1. 无刷新跳转会让脚本「失忆」

本站在用 Swup 做页面切换，点站内链接不会整页刷新，只替换 `<main>` 和目录这两个容器。

最开始我把 giscus 的加载脚本写在评论区组件里 —— 也就是 `<main>` 内部。结果有两个问题：

- 每次页面跳转，脚本都会被**重新执行**一次，可能重复插入评论区
- 更麻烦的是：访客如果从首页进来，压根没渲染过文章页的组件，脚本也就没机会注册；之后从首页跳到文章页，评论区不会加载

所以最后把加载逻辑挪到了 `src/layouts/Layout.astro`：它在每个页面上都存在、又不在 Swup 替换的范围内，整站只注册一次，再由 Swup 的 `page:view` 事件按需注入 iframe。

## 2. 明暗配色不能听系统偏好

giscus 官方推荐的配置是 `data-theme="preferred_color_scheme"`，意思是跟随**操作系统**的深浅色设置。

但本站的明暗模式是独立的：访客可以在显示设置里手动选浅色、深色或「跟随系统」，这个选择存在浏览器本地，和系统的实际设置未必一致。如果评论区单独跟着系统走，就会出现页面深色、评论区浅色的割裂感。

解决办法是监听 `<html>` 上 `dark` 类的变化 —— 访客在站内一切换主题，就用 `postMessage` 通知 iframe 换配色。用通知而不是整块重新加载，评论区不会闪一下。

# 最后

欢迎在下面试试。如果不想登录 GitHub、或者想直接聊，导航栏和侧边栏都能找到我。
