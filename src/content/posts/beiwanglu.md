---
title: 一个备忘录
published: 2026-09-25
description: '一个帮助我维护网站的备忘录'
image: ''
tags: [网站维护]
category: '网站维护'
draft: false 
lang: ''
---
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
