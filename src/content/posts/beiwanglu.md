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

图片文件放在 `src/content/posts/img/` 下，用相对路径引用：

```
![图注文字](./img/photo.jpg)
```

实际效果（下面这张就是上面那行语法插进来的）：

![樱花下的少女](./img/girl_art_anime_1313052_1280x720.jpg)

# 视频相关

## 方式一：嵌入 B 站视频

把 `bvid` 换成视频的 BV 号。外面套一层 16:9 的容器，播放器就会跟着屏幕宽度自适应：

```
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
<iframe src="https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&high_quality=1&danmaku=0&autoplay=0" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>
```

实际效果（BV1GJ411x7h7，滚到这里才会加载，不会自动播）：

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
<iframe src="https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&high_quality=1&danmaku=0&autoplay=0" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>

不想要自适应、固定高度就够了的话，用简写版：

```
<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=你的BV号&autoplay=0" loading="lazy" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
```

## 怎么保证不自动播放

三个手段叠加，基本杜绝：

```html
<iframe src="https://player.bilibili.com/player.html?bvid=xxx&autoplay=0" loading="lazy" ...>
```

- **别写 `autoplay=1`** —— B 站播放器默认就是不自动播放的，会自己播通常是因为复制来的模板里带了 `autoplay=1`
- **`&autoplay=0`** —— 显式关掉。这个参数在部分播放器版本上不太靠谱，所以还要配下面一条
- **`loading="lazy"`** —— 浏览器原生懒加载：iframe 没滚进视口附近就压根不加载，没加载自然不可能出声。这条是浏览器层面的，比 B 站自己的参数可靠，附带还加快了首屏速度

另外浏览器本身有自动播放策略：**带声音的自动播放会被拦截**，只有静音才允许。所以哪怕参数失效，正常情况下也吵不到人。

真遇到顽固的自动播放，终极方案是「封面图 + 点击再加载」：先放一张封面，用户点一下才把 iframe 插进 DOM。需要的话我可以写成一个组件，在 Markdown 里一行就能用。

## 方式二：播放 mp4（站内文件或外链）

`<video>` 标签是浏览器原生的播放器，`controls` 负责显示进度条，`width: 100%` 让它跟着正文宽度走：

```
<video src="/fuwari/files/demo.mp4" controls preload="none" style="width: 100%; border-radius: var(--radius-large);"></video>
```

实际效果（这里用的是外链示例文件，换成你自己放在 `public/files/` 下的 mp4 就是同样的效果）：

<video src="https://media.w3.org/2010/05/sintel/trailer.mp4" controls preload="none" style="width: 100%; border-radius: var(--radius-large);"></video>

# 文件相关

## 文件放哪里

`src/content/posts/img/` 只会处理图片，其他类型（zip / pdf / docx / xlsx / mp4）放到 `public/files/` 下，
构建时会原样复制出去，不做压缩和改名。

注意链接必须带上站点的 base —— 本站是 GitHub Pages 的项目仓库，base 为 `/fuwari`，
写成 `/files/xxx.zip` 会 404：

```
[点此下载测试文件](/fuwari/files/test.zip)
```

想让浏览器直接弹下载、而不是在线打开，用 HTML 标签加 `download` 属性
（Astro 的 Markdown 允许内嵌 HTML）：

```
<a href="/fuwari/files/test.zip" download>📥 下载测试文件（523 B）</a>
```

## 实际效果

已建好一个测试文件，点下面这个链接就能下载到：

<a href="/fuwari/files/test.zip" download>📥 下载测试文件 test.zip（523 B）</a>

包内是一个 [test.txt](/fuwari/files/test.txt) 和一份说明，用来确认下载链路是通的。

## 几点注意

- `public/` 里的文件会一起进 git 仓库，单文件别超过 100 MB（GitHub 限制），大文件建议放网盘或对象存储再外链
- 文件名用英文、不带空格，免得 URL 编码后出幺蛾子
- 在线预览 / 直接下载取决于浏览器对文件类型的处理，压缩包一定是下载，pdf 和 txt 多半是直接打开 —— 要强制下载就加 `download`