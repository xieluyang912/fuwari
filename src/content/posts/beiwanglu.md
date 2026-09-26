---
title: 一个备忘录
published: 2026-09-25
description: '一个帮助我维护网站的备忘录'
image: 'img\girl_umbrella_anime_151317_1280x720.jpg'
tags: [网站维护]
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
![Static Badge](https://img.shields.io/badge/applemusic-xxllyy-red?logo=applemusic)
![Static Badge](https://img.shields.io/badge/zotero-xxllyy-blue?logo=zotero)
![Static Badge](https://img.shields.io/badge/counterstrike-Aaamazing-yellow?logo=counterstrike)
![Static Badge](https://img.shields.io/badge/ea-xxllyy-orange?logo=ea)


</div>

# 创建新文章

```bash
pnpm new-post <filename>
```

# 推送项目到GitHub

```bash
git status                      # 查看改了哪些文件
git add .                       # 添加所有修改
git commit -m "说明"            # 提交到本地仓库
git pull --rebase origin main   # 先拉取最远端代码
git push origin main            # 推送到GitHub
```

# 文章图片相关

## 封面图

封面图写在文章开头的 frontmatter 里（图片文件放在 `src/content/posts/img/` 下）：

```
image: ./img/cover.jpg
```

## 正文插图

```
![图注文字](./img/photo.jpg)
```

# 视频相关

```
<iframe width="100%" height="468" src="//player.bilibili.com" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

```
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
<iframe src="https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&page=1&high_quality=1&danmaku=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>
```
