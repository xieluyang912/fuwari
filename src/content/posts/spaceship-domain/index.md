---
title: 博客更新日志：从 Spaceship 买域名，到 007912.xyz 能打开
published: 2026-09-27
description: '在 Spaceship 下单、加解析记录、绑进 GitHub Pages，以及改 base 路径时踩到的两个坑'
image: ./cover.jpg
tags: [网站维护, 域名, GitHub Pages]
category: '网站维护'
draft: false
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/%E7%B1%BB%E5%9E%8B-%E7%AC%94%E8%AE%B0-blue)
![Static Badge](https://img.shields.io/badge/%E5%BD%92%E5%B1%9E-%E7%BD%91%E7%AB%99%E7%BB%B4%E6%8A%A4-orange)
![Static Badge](https://img.shields.io/badge/%E6%B3%A8%E5%86%8C%E5%95%86-Spaceship-1d4ed8)
![Static Badge](https://img.shields.io/badge/%E8%A7%A3%E6%9E%90-DNS-0ea5e9)
![Static Badge](https://img.shields.io/badge/%E6%89%98%E7%AE%A1-GitHub%20Pages-24292f?logo=github)
![Static Badge](https://img.shields.io/badge/%E5%8D%8F%E8%AE%AE-HTTPS-22c55e?logo=letsencrypt)

</div>

这个站现在可以通过 <https://007912.xyz> 访问了。这一篇把从买域名到真正能打开的全过程记下来 —— 前面是步骤，最后是踩到的两个坑，其中一个把评论区清空了。

# 为什么要买域名

在此之前站点一直挂在默认地址上，形如 `xieluyang912.github.io/fuwari/`。能用，但有几个别扭的地方：

- 分享出去的链接又长又像一串编号，看着不像个正经站点
- 以后要是换个托管（比如从 GitHub Pages 挪到别的静态托管），地址就全变了
- 域名是自己的东西，托管商可以换，域名不用换

所以决定自己买一个。

# 一、在 Spaceship 下单

Spaceship 是 Namecheap 团队做的注册商，界面比传统注册商干净一些。它有个好处是域名自带免费的 Basic DNS 和 Whois 隐私保护 —— 这两样在别家经常要单独加钱或者单独开开关。

流程本身没什么特别的：

1. 打开 <https://www.spaceship.com>，在搜索框里输入想要的域名
2. 列表里显示能不能注册、首年多少钱
3. 加入购物车，选注册年限（最少 1 年）
4. 结账：填邮箱、注册账号、付款

:::note[下单前先看一眼续费价]
`.xyz` 这类后缀首年经常便宜得离谱，续费价却是另一个数量级。结账页一般会写明续费多少钱，介意的话就把年限一次买长一点，或者记下来明年提前比价。
:::

买完之后进入域名的 Manage 页面，有两个开关值得确认一下：

- **Auto-renew（自动续费）**：建议打开。域名过期被释放之后，赎回价通常是注册价的几十倍，还可能已经被别人抢注了。
- **Whois privacy（隐私保护）**：Spaceship 对多数后缀是默认送的，确认它是开着的 —— 不然你的姓名、邮箱、电话会直接暴露在 whois 查询里。

# 二、加解析记录，把域名指向 GitHub Pages

GitHub Pages 对外服务的 IP 是固定的。根域名要用 **A 记录**（IPv4）和 **AAAA 记录**（IPv6）指过去，`www` 用一条 CNAME 指到默认域名。

在 Spaceship 的域名管理页找到 DNS（有的地方叫 Advanced DNS），照下面的表加：

| 类型 | 主机 | 值 | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 自动 |
| A | @ | 185.199.109.153 | 自动 |
| A | @ | 185.199.110.153 | 自动 |
| A | @ | 185.199.111.153 | 自动 |
| AAAA | @ | 2606:50c0:8000::153 | 自动 |
| AAAA | @ | 2606:50c0:8001::153 | 自动 |
| AAAA | @ | 2606:50c0:8002::153 | 自动 |
| AAAA | @ | 2606:50c0:8003::153 | 自动 |
| CNAME | www | xieluyang912.github.io | 自动 |

几个容易写错的地方：

- **主机名只填「这一段」**。根域名那一栏填 `@` 或者留空，`www` 就只写 `www`，不要把整个域名再写一遍 —— 写成 `www.007912.xyz.007912.xyz` 是很常见的低级错误。
- **CNAME 的值不带仓库名、不带斜杠、末尾不加点**。是 `xieluyang912.github.io`，不是 `xieluyang912.github.io/fuwari`。
- **根域名不能用 CNAME**。DNS 规范不允许根域出现 CNAME，所以根域老老实实用 A / AAAA。
- AAAA 那四条是 IPv6，不是必须的，加上没坏处。
- 如果域名刚买，面板里可能已经有一套默认的 parking 记录，注意别和自己的记录打架。

改完要等它生效，通常几分钟，慢的话几小时，取决于 TTL 和各地 DNS 缓存的脾气。

# 三、在 GitHub Pages 里绑定域名

进仓库的 Settings → Pages：

1. **Build and deployment → Source** 选 `GitHub Actions`。本站的 `.github/workflows/deploy.yml` 就是按这个前提写的，选错了部署步骤会直接报错。
2. **Custom domain** 填 `007912.xyz` —— 只填域名，不要带 `https://`，也不要带路径 —— 然后 Save。
3. 等 GitHub 做 DNS check。它会去查你刚加的那几条 A 记录；没生效就会提示 DNS check unsuccessful，不用慌，过一会儿再点一次就行。
4. check 通过之后，**Enforce HTTPS** 的勾才能真正点上。证书由 GitHub 自动签发，一般几分钟到十几分钟，偶尔要等到 24 小时 —— 在这之前 https 打不开是正常的。

:::note[为什么要在 public/ 里放一份 CNAME]
用「分支 + 目录」的方式发布时，GitHub 会往仓库里写一个 `CNAME` 文件来记住自定义域名。但本站是用 Actions 发布构建产物的，没有那个分支，GitHub 没地方写 —— 所以要自己在 `public/CNAME` 里放一份，构建时会被原样复制到 `dist` 根目录。

这份文件一旦丢了，自定义域名的设置会被重置，站点就退回默认地址了。
:::

# 四、改站点自己的配置

域名换掉之后，站点里有两处必须跟着改，否则站点能打开、但生成出来的链接还是旧的：

```js
// astro.config.mjs
site: "https://007912.xyz",  // sitemap、RSS、OG 标签用的绝对地址
base: "/",                   // 绑定自定义域名后站点位于根路径
```

```txt
# public/CNAME
007912.xyz
```

`site` 影响的是构建时生成的绝对链接：`sitemap.xml`、RSS 里的文章地址、分享到社交平台时的 OG 卡片。忘了改的话，页面本身没事，但搜索引擎和 RSS 阅读器拿到的还是老地址。

`base` 则是路径前缀。绑了自定义域名，站点就在根路径上，所以是 `/`。（哪天想改回用默认地址访问，这里要改回 `/fuwari/`，同时删掉 `public/CNAME`。）

# 踩到的两个坑

## 1. base 一改，评论区全空了

这是这次最难受的一个。

换域名之后，所有旧文章底部的评论都不见了 —— 去 GitHub Discussions 里看，评论还在，页面上就是不显示。

原因是评论用的 giscus 按 `pathname` 匹配 discussion：

- 换域名前：`https://xieluyang912.github.io/fuwari/posts/hello-world/`
- 换域名后：`https://007912.xyz/posts/hello-world/`

`base` 从 `/fuwari/` 变成 `/`，页面路径整体短了一截，giscus 拿着新路径去 Discussions 里找，自然对不上任何一条。

已经产生的评论不会自动迁移。根治的办法是**换一种匹配方式**：把 giscus 的 `mapping` 从 `pathname` 改成 `og:title`，改成按文章标题匹配。这样评论就和域名、路径彻底解耦，以后再换域名也不会丢。代价是文章标题不能随便改。

## 2. Enforce HTTPS 一直点不动

绑完域名去勾 HTTPS，发现那个框是灰的、点不了。

这不是出错了，是顺序问题：GitHub 得先确认域名确实解析到了它、再签发证书，然后「强制 HTTPS」才可用。等的期间可以先自己验证一下解析通没通：

```bash
nslookup 007912.xyz
# 或者直接看响应头
curl -I http://007912.xyz
```

如果 `nslookup` 查不到或者还返回旧 IP，先清一下本机 DNS 缓存（Windows 上是 `ipconfig /flushdns`），再等一会儿。

# 最后

顺带记一句：域名解析到 GitHub Pages 这种境外托管，是**不需要 ICP 备案**的 —— 备案针对的是放在国内服务器上的站点。代价是国内访问的速度和稳定性看运气，这个只能自己权衡。

现在站点在 <https://007912.xyz>；绑定自定义域名后，原来的默认地址也会跳转到新域名。如果你发现有哪里还是老链接、或者某篇文章的评论对不上，欢迎在下面说一声。
