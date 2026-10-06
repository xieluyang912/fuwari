# 文章文件夹方案

每篇文章拥有一个独立文件夹，正文入口是 `index.md`，
封面、插图等专属资源就近放在同一层，用 `./` 相对路径引用。

## 目录结构

```
src/content/posts/
├── hello-world/
│   ├── index.md          ← 正文
│   ├── cover.jpg         ← 封面（frontmatter 的 image 字段）
│   └── photo-1.png       ← 正文插图
└── mizuki-relayout/
    ├── index.md
    └── cover.jpg
```

## 为什么不用第三方图床

| 维度 | 文件夹方案 | 第三方图床 |
| --- | --- | --- |
| 数据控制权 | 100% 自主，与文章的 Git 历史一起版本化 | 受平台政策制约，图床挂了图就没了 |
| 稳定性 | 与站点部署产物同源直出，无防盗链问题 | 可能被限制外链、失效或服务终止 |
| 构建优化 | Astro 构建期自动压缩、转 WebP、生成响应式 srcset | 通常按原格式加载，没有深度优化 |
| 维护 | 删文章时整个文件夹一起删，不留孤儿素材 | 废弃图片极难检索清理 |
| 离线 | 断网也能本地预览 | 断网看不到图 |

## 引用方式

**封面**（frontmatter，约定统一叫 `cover.<扩展名>`）：

```yaml
---
title: 深度学习模型训练笔记
published: 2026-09-01
image: './cover.jpg'
tags: [PyTorch]
---
```

**正文插图**（直接用相对路径）：

```md
![收敛曲线](./loss-curve.png)
```

两种写法都会在构建期被 Astro 处理：压缩、转格式、生成响应式图片。
手写 `<img>` 或引用 `public/` 下的绝对路径则会绕过这些优化。

## 多图片时的子目录

插图超过 10 张时，建议在文章文件夹下再开一层，保持目录整洁：

```
article-name/
├── index.md
├── cover.jpg
└── images/
    ├── step-1.png
    └── step-2.png
```

引用写成 `./images/step-1.png`。

## 路由规则

**文件夹名就是 URL。** `posts/hello-world/index.md` → `/posts/hello-world/`。

重命名文件夹极其安全：URL 跟着变，文件夹内的图片相对引用**完全不受影响**
（这也是文件夹方案相对平铺方案最大的好处 —— 平铺时改文件名要手工检查
所有 `./img/xxx` 引用）。

> ⚠️ 但改 URL 会让已有的 **giscus 评论对不上号**。
> 评论存放在 GitHub Discussions 里不会丢，只是不再显示在新路径下。
> 详见 `src/config.ts` 里 `commentConfig.giscus.mapping` 的说明。

## 新建文章

```bash
pnpm new-post hello-world
```

会生成 `src/content/posts/hello-world/index.md`（脚本见 `scripts/new-post.js`）。
之后把图片直接放进 `src/content/posts/hello-world/` 即可。

## 相对路径是怎么被解析的

| 位置 | 解析者 | 说明 |
| --- | --- | --- |
| frontmatter 的 `image` | `src/components/misc/ImageWrapper.astro` | 接收 `basePath`（= 文章所在目录），再由 `import.meta.glob` 找到真实模块 |
| 正文里的 `![](./x.png)` | Astro 内容集合 | 相对于 `index.md` 所在目录解析 |
| 文章列表 / RSS 里的封面 | `src/utils/content-utils.ts` + `rss.xml.ts` | 会把相对路径解析成带域名的绝对直链 |

## 非图片附件

zip / pdf / docx / xlsx / mp4 这类文件不参与图片优化，
放在 `public/files/` 下，构建时原样复制。

引用时必须带上站点的 base 路径（本站绑定了自定义域名，base 是 `/`）：

```md
[点此下载](/files/test.zip)
```

## 从平铺方案迁移

本站的文章原本是平铺的（`posts/foo.md` + 一个公共的 `posts/img/` 目录），
已经全部迁移到文件夹方案。迁移时遵循两个原则：

1. **文件夹名沿用原来的文件名**，所以所有文章 URL 一字未变，
   已有的链接和 giscus 评论全部继续有效；
2. **只改最终的展示形式**：frontmatter 的 `image: 'img\cover.jpg'`
   改成 `image: './cover.jpg'`，正文的 `![](./img/x.png)` 改成 `![](./x.png)`。

迁移时必须跳过**围栏代码块和行内代码** ——
站内有几篇文章正是在用代码块演示「图片该怎么写」，那些示例路径不能被改写。
