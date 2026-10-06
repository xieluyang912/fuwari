# Bilibili 集成

本站集成了 Bilibili 的四块能力，其中前三块互不相干，唯一的共同点只是都叫 Bilibili：

| 能力 | 用途 | 何时访问外网 |
| --- | --- | --- |
| 追番列表同步 | 抓取你在 B 站的追番列表，渲染 `/anime/` 的「追番」区块 | 只在显式执行 `pnpm anime:sync` 时 |
| 投币视频同步 | 抓取你最近投过币的视频，渲染 `/anime/` 的「最近投币」区块 | 只在显式执行 `pnpm anime:sync` 时 |
| 粉丝勋章同步 | 抓取你的直播间勋章墙，渲染独立的 `/medals/` 页面 | 只在显式执行 `pnpm anime:sync` 时 |
| 数字收藏集同步 | 抓取你收集到的数字卡牌，渲染独立的 `/collections/` 页面 | 只在显式执行 `pnpm anime:sync` 时 |
| 视频门面嵌入 | 在文章里用 `::bilibili{}` 嵌入 B 站播放器 | 只在访客点击播放按钮时 |

这四块共用同一个同步命令、同一套封面本地化与快照机制，但**走的是四个不同的接口、
写四份独立的快照**，所以互不影响 —— 追番抓不到的时候其它几块照样显示。

> ⚠️ **「收藏夹」和「收藏集」是两个完全不同的东西**，中文名长得像但毫无关系：
>
> | | 收藏夹 | 收藏集 |
> | --- | --- | --- |
> | 是什么 | 你收藏**视频**用的文件夹 | 装扮体系里的**付费数字卡牌**产品 |
> | 在哪看 | `space.bilibili.com/<mid>/favlist` | App「我的 → 个性装扮 → 收藏集」 |
> | 接口 | `api.bilibili.com/x/v3/fav/...` | `api.bilibili.com/x/vas/dlc_act/...` |
>
> **本站只做「收藏集」**（`/collections/`），不做收藏夹 —— 后者只是一个视频列表，
> 和站点已有的归档页定位重复，没必要单独开一个页面。

## 凭据需求一览

四块同步对登录态的要求各不相同，动手前先看这张表：

| 能力 | 需要 SESSDATA？ | 说明 |
| --- | --- | --- |
| 追番 | 仅私密列表需要 | 公开列表匿名可读；私密时返回 `code 53013` |
| 投币视频 | 不需要 | 但要求「投币视频」可见性设为公开 |
| 粉丝勋章 | **必须** | 匿名一律 `-101 账号未登录`，没有任何绕过的办法 |
| 数字收藏集 | **必须** | 同上；而且首次还需要一次全量扫描 |

> 也就是说：**只要配一次 `.env` 里的 `BILI_SESSDATA`，四块就全通了。**

---

# 一、追番列表同步

## 快速开始

1. 在 `src/config/animeConfig.ts` 里填好你的 B 站数字 UID：

   ```ts
   providers: {
     bilibili: {
       enable: true,
       vmid: "3546912602982411",   // 就是 space.bilibili.com/<这一串>
       ...
     },
   }
   ```

2. 执行同步，生成快照：

   ```bash
   pnpm anime:sync --provider bilibili
   ```

3. 正常 `pnpm build`。页面会读那份快照。

## 配置

`src/config/animeConfig.ts`：

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | `boolean` | `true` | 是否启用番剧页。关闭后导航入口一并隐藏 |
| `source.kind` | `"local" \| "snapshot"` | `"snapshot"` | 数据来源 |
| `source.provider` | `"bilibili" \| "bangumi"` | `"bilibili"` | 快照来自哪个 provider |
| `source.file` | `string` | `<provider>.json` | 快照文件名。自定义的名字属于「用户输入」，同步脚本永不写入 |
| `fallback.kind` | `"local" \| "empty"` | `"local"` | 快照缺失/损坏时的降级方式 |
| `providers.bilibili.vmid` | `string` | — | B 站数字 UID（必填） |
| `providers.bilibili.sessdataEnv` | `string` | `"BILI_SESSDATA"` | 读取私密追番凭据的环境变量名 |
| `providers.bilibili.cover.mode` | `"local" \| "remote" \| "none"` | `"local"` | 封面策略 |
| `providers.bilibili.cover.useWebp` | `boolean` | `true` | 是否让 B 站 CDN 返回 WebP |
| `providers.bilibili.request.pageSize` | `number` | `30` | 单页大小（10 ~ 50） |
| `providers.bilibili.request.maxItems` | `number` | `300` | 最多抓多少条 |
| `providers.bilibili.request.minDelayMs` | `number` | `300` | 请求间隔（毫秒） |
| `snapshot.directory` | `string` | `src/data/anime-snapshots` | 快照目录 |
| `snapshot.staleAfterDays` | `number` | `30` | 超过多少天就在构建日志里提醒重新同步 |
| `snapshot.keepLastValid` | `boolean` | `true` | 抓到空列表时是否保留上一份有效快照 |

## 接口

```
GET https://api.bilibili.com/x/space/bangumi/follow/list
    ?type=1                固定 1（追番；2 是追剧）
    &follow_status=<1|2|3> 1 想看 / 2 在看 / 3 看过
    &vmid=<UID>
    &ps=<10..50>           单页大小
    &pn=<1..>              页码
```

请求头：

```
User-Agent: 合规桌面浏览器 UA
Referer:    https://space.bilibili.com/
Cookie:     SESSDATA=<...>;    ← 仅当追番列表设为私密时才需要
```

响应形如：

```json
{
  "code": 0,
  "message": "0",
  "data": {
    "list": [
      {
        "media_id": 28228367,
        "season_id": 34209,
        "title": "间谍过家家",
        "cover": "http://i0.hdslb.com/bfs/bangumi/image/....jpg",
        "total_count": 25,
        "progress": "看到第12话",
        "rating": { "score": 9.7 },
        "evaluate": "为了潜入名校……",
        "publish": { "pub_time": "2022-04-09 23:00:00" },
        "styles": ["搞笑", "日常", "漫画改"]
      }
    ],
    "total": 45
  }
}
```

### 状态码

| code | 含义 | 处理 |
| --- | --- | --- |
| `0` | 成功 | — |
| `53013` / `-401` / `-400` | 追番列表被设为私密 | 提示需要合法的 `SESSDATA`，停止该状态的分页 |

私密列表的处理方式：在项目根目录建 `.env`（**已在 `.gitignore` 里**）：

```
BILI_SESSDATA="你的 SESSDATA"
```

`.env` 只会被同步脚本读取，且**已经存在于 `process.env` 的键不会被覆盖**，
所以 CI 里用 secrets 注入的同名变量优先级更高。

## 封面防盗链

B 站图床（`hdslb.com`）对外站有严格的 Referer 校验，直接把 URL 贴到页面里
大概率是破图。`cover.mode: "local"` 时同步脚本会把封面下载到：

```
public/assets/anime/covers/bili_<season_id或media_id>.<ext>
```

下载时会给 URL 追加 B 站 CDN 自己的处理参数 `@220w_280h.webp`：
**真正干活的是 B 站的图片服务，本地不跑任何图片转码**（不依赖 sharp），
拿到的就是裁好尺寸的 WebP，通常只有十几 KB。

文件扩展名从**文件头魔数**判断（其次是 `content-type`，最后兜底 `webp`）：
B 站 CDN 加了 `@...webp` 之后返回的仍可能是 JPEG，光看后缀会写错扩展名。

下载失败会退回远程 URL，不会让整次同步失败。

`remote` 模式则只追加 CDN 参数、保留远程地址；
`none` 模式不使用封面，卡片显示渐变占位。

## 安全

落盘前会扫描快照内容，命中 `SESSDATA` / `cookie:` / `authorization:` /
`access_token` / `refresh_token` / `csrf` 任一模式就**中止写入**。
凭据只该存在于 `process.env`，绝不该出现在要提交进 Git 的快照里。

写入是原子的：先写临时文件再 `rename`。同步中途被打断时，
线上那份快照仍然是完整的。

## 为什么不在构建期抓取

`astro build` 全程不碰网络，这是刻意的：

- 构建环境常常没有外网，把网络请求放进构建会变得很脆；
- B 站挂了不应该导致博客发布失败；
- 「今天部署的产物」和「昨天部署的产物」应当可复现。

代价是数据会停留在最后一次同步的时刻，所以 `snapshot.staleAfterDays`
到期后会在构建日志里提醒你。

## 快照格式

`src/data/anime-snapshots/bilibili.json`：

```jsonc
{
  "schemaVersion": 1,
  "provider": "bilibili",
  "fetchedAt": "2026-10-06T08:35:03.419Z",
  "accountRef": "3546912602982411",
  "items": [
    {
      "title": "Lycoris Recoil",
      "status": "completed",
      "rating": 9.8,
      "year": "2022",
      "genres": ["Action", "Slice of Life"],
      "progress": { "watched": 12, "total": 12 },
      "cover": "/assets/anime/covers/bili_12345.webp",
      "link": "https://www.bilibili.com/bangumi/media/md28338623",
      "description": "…",
      "studio": "Aniplex",
      "identity": { "provider": "bilibili", "seasonId": "12345", "sourceId": "28338623" }
    }
  ]
}
```

解析时也兼容**裸数组**格式（早期格式 / 手工拷贝），见 `parseAnimeSnapshot()`。

## 数据校验

外部接口返回的内容一律视为不可信输入，`src/utils/anime/normalize.ts` 会洗一遍：

- 状态做白名单（并容忍 `onhold` / `ON_HOLD` 这类写法）；
- 评分夹到 0 ~ 10，保留一位小数；
- 图片只放行 `https://` 与站内 `/` 开头的路径 —— 这条是安全边界而不是格式偏好，
  `javascript:` / `data:` 一旦进了 `<img src>` 就是可执行的注入点；
- 简介去掉 HTML 标签与实体，压缩空白，截断到 500 字；
- 题材去重、去 `#`、单个限长 30 字、最多 6 个。

## CLI

```bash
pnpm anime:sync                     # 按配置里的 source.provider 决定同步谁
pnpm anime:sync --provider bilibili # 指定 provider
pnpm anime:sync --if-stale          # 只在快照过期时才同步（适合放进 CI 定时任务）
```

退出码：provider 失败 → `1`；「没配置」「保留了旧快照」→ `0`
（不让「有意保留旧档」这种事中断部署流水线）。

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/config/animeConfig.ts` | 配置 + `resolveAnimeOptions()` |
| `src/types/animeConfig.ts` | 配置类型 |
| `src/data/anime.ts` | `AnimeItem` 类型 + 本地兜底数据 |
| `scripts/anime/sync.mjs` | 同步入口 |
| `scripts/anime/providers/bilibili.mjs` | B 站抓取 + 封面下载 |
| `scripts/anime/snapshot-store.mjs` | 落盘决策与原子写入 |
| `scripts/anime/load-env.mjs` | 极简 `.env` 加载 |
| `src/utils/anime/normalize.ts` | 校验与归一化 |
| `src/utils/anime-data.ts` | `getAnimeList()` |
| `src/utils/snapshot.ts` | 快照读取的公共逻辑（追番与投币共用） |
| `src/pages/anime.astro` | `/anime/` 页面 |

---

# 二、投币视频同步

`/anime/` 页面下半部分的「最近投币」区块，数据来自另一份快照。

## 配置

`src/config/animeConfig.ts` 的 `providers.bilibili.coins`：

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | `boolean` | `true` | 是否同步投币列表（`animeConfig.enable` 关掉时整个区块一起消失） |
| `maxItems` | `number` | `12` | **页面上**最多展示多少条 |
| `pageSize` | `number` | `20` | 单页请求条数 |
| `file` | `string` | `bilibili-coins.json` | 快照文件名 |

> `maxItems` 在**读取侧**才截断，快照里始终留全量数据。
> 所以想多显示几条，改配置重新构建即可，不用重新同步。

## 接口

```text
GET https://api.bilibili.com/x/space/coin/video?vmid=<UID>&pn=<页>&ps=<每页>

→ { "code": 0, "data": [ ...视频对象 ] }
```

三个和追番接口不一样的地方，都踩过：

1. **`data` 是裸数组**，不是 `{ list, total }`。没有 total 可比对，
   只能靠「这一页返回的条数够不够」判断有没有下一页。
2. **不需要登录**，返回的是用户公开的投币记录。
   前提是在 B 站「隐私设置 → 投币视频」里设为**公开**，
   否则返回 `code 53013`（和追番列表私密时是同一个码）。
3. **`pn` 参数实际上被忽略** —— 实测两个账号，`pn=1` 与 `pn=2` 返回完全相同的列表。

第 3 条会直接坑到分页逻辑：如果照常 `pn++` 循环，就会无限翻同一页。
所以同步脚本用「**本页有没有新 bvid**」来兜底：

```js
const fresh = list.filter((item) => item?.bvid && !seen.has(item.bvid));
if (fresh.length === 0) break;   // 分页没生效，或者已经到底了
```

配合「返回条数不足一页就停」，两种行为（分页生效 / 不生效）都能正确收敛。

## 排序依据

按 **`time`（我投币的时间）** 倒序，而不是视频的 `pubdate`。

这两个字段差得很远：完全可能今天给一个五年前的老视频投币。
按发布时间排的话它会沉到列表底部，而「最近投币」看的就是**我什么时候投的**。

接口里的对应关系：

| 接口字段 | 含义 |
| --- | --- |
| `time` | 我投币的时间戳 → `coinedAt` |
| `pubdate` | 视频发布时间戳 → `publishedAt` |
| `coins` | 我投了几个币 |
| `stat.coin` | 这个视频收到的**总**投币数（和上面完全是两回事） |

> 页面上这两个币数都会显示：封面左上角的 `×2` 是我投的，
> 卡片底部计数行里的「投币」是整个视频的总数。

## 封面

和追番封面同一套机制（同一个图床、同一个 Referer 校验、同一个魔数嗅探），
只有目标目录和尺寸不同：

```text
public/assets/bilibili/covers/coin_<bvid>.<ext>
```

尺寸参数用 `@480w_270h.webp`（16:9），因为视频封面是横版；
追番封面是竖版海报，用的是 `@220w_280h.webp`。

## 快照格式

`src/data/anime-snapshots/bilibili-coins.json`：

```jsonc
{
  "schemaVersion": 1,
  "provider": "bilibili",
  "kind": "coins",
  "fetchedAt": "2026-10-06T09:01:10.796Z",
  "accountRef": "3546912602982411",
  "items": [
    {
      "bvid": "BV1CRahzZEmy",
      "title": "……",
      "cover": "/assets/bilibili/covers/coin_BV1CRahzZEmy.webp",
      "author": { "mid": "18026414", "name": "……" },
      "duration": 245,
      "publishedAt": "2025-09-05T10:57:37.000Z",
      "coinedAt": "2026-09-30T16:35:33.000Z",
      "coins": 2,
      "stats": { "view": 5269096, "danmaku": 33145, "like": 248137, "coin": 239450, "favorite": 55642 },
      "category": "翻唱",
      "link": "https://www.bilibili.com/video/BV1CRahzZEmy/"
    }
  ]
}
```

同样兼容**裸数组**格式，见 `parseCoinSnapshot()`。

## 数据校验

`src/utils/bilibili/normalize.ts` 做的事和追番那份类似，另外多两条：

- **BV 号必须匹配 `^BV[1-9A-HJ-NP-Za-km-z]{10}$`** —— 它既是去重主键，
  也是拼链接的唯一依据，不合法就丢掉整条。
- **外链限定 B 站域名**。`link` 走白名单校验，
  只放行 `bilibili.com` 与 `b23.tv`，免得接口被篡改时把访客引到站外。

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/data/bilibili.ts` | `BilibiliVideo` 类型 + 兜底数据 |
| `src/utils/bilibili/normalize.ts` | 校验、归一化、排序、时长格式化 |
| `src/utils/bilibili-data.ts` | `getCoinVideos()` |
| `scripts/anime/providers/bilibili.mjs` | `fetchBilibiliCoins()` |

---

# 三、粉丝勋章同步

独立的 `/medals/` 页面，每枚勋章一张卡片：主播头像与昵称、直播状态、
勋章本体（按 B 站直播间的样式渲染的彩色 pill）、亲密度进度条。

## ⚠️ 这一块必须配 SESSDATA

勋章墙接口在 **live** 域下，不在 `api.bilibili.com`：

```text
GET https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id=<你的mid>
Cookie: SESSDATA=<...>;
```

匿名请求一律返回：

```json
{ "code": -101, "message": "账号未登录", "ttl": 1 }
```

这个和收藏夹那边完全不同 —— 收藏夹是「列目录要登录、读内容不用」，
而勋章墙是**整个接口都校验登录态**。换域名、补参数、加 `buvid3` Cookie、
加 WBI 签名，都绕不过去（都实测过）。所以这块**没有免凭据的用法**。

配置方式：在项目根目录建 `.env`（已在 `.gitignore` 里）：

```
BILI_SESSDATA="你的 SESSDATA"
```

怎么取：浏览器登录 B 站 → F12 → Application → Cookies → `https://www.bilibili.com`
→ 找到 `SESSDATA`，复制它的值。

没配凭据时同步脚本会**跳过并且不发任何请求**，页面上显示的是
「怎么配」的提示而不是一片空白。

> ⚠️ SESSDATA 等同于你的登录态，泄漏了别人就能以你的身份操作。
> 它只应该待在 `.env` 里，绝不要提交进 Git —— 同步脚本落盘前会扫描
> `SESSDATA` / `cookie:` / `access_token` 之类的敏感串，命中就中止写入。

## 配置

`src/config/animeConfig.ts` 的 `providers.bilibili.medals`：

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | `boolean` | `true` | 是否同步勋章 |
| `maxItems` | `number` | `60` | 最多保留多少枚 |
| `file` | `string` | `bilibili-medals.json` | 快照文件名 |

## 排序

**佩戴中 → 等级从高到低 → 亲密度从高到低**。

佩戴中的排最前是因为那是用户当前的选择，B 站自己的勋章墙也是这么排的。

## 配色

接口给了**两套**颜色字段，取的时候新的优先：

| 来源 | 字段 | 格式 |
| --- | --- | --- |
| 新版（优先） | `uinfo_medal.v2_medal_color_start` / `_end` / `_border` / `_text` | `"#5762A799"`（8 位，带透明度） |
| 老版（兜底） | `medal_info.medal_color_start` / `_end` / `_border` | 十进制整数，如 `6067854` |

新版才是 B 站当前界面真正在用的配色（含透明度），所以优先用；
老版按 `#RRGGBB` 转出来兜底。两套都没有时退回主题色，
保证任何情况下都不会渲染出一枚看不见的勋章。

字段最终落到 `colorStart` / `colorEnd` / `colorBorder` / `colorText`，
页面直接塞进 CSS 变量（`--medal-start` 等）—— 每枚勋章颜色都不同，
用 Tailwind 类名表达不了。

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/data/bilibili.ts` | `BilibiliFanMedal` 类型 + 兜底数据 |
| `src/utils/bilibili-data.ts` | `getFanMedals()` |
| `src/pages/medals.astro` | `/medals/` 页面 + 勋章 pill 的样式 |
| `scripts/anime/providers/bilibili.mjs` | `fetchBilibiliMedals()` |

---

# 四、数字收藏集同步

独立的 `/collections/` 页面：每个收藏集一张卡片，显示封面、名称、
「已收集 X / Y」进度条，以及我拥有的卡牌列表。

> ⚠️ **再次强调：这不是收藏夹。** 收藏集是 B 站装扮体系里的付费数字卡牌产品，
> 和「收藏视频用的文件夹」没有任何关系。

## 最麻烦的一点：没有「我拥有哪些收藏集」的接口

B 站的收藏集接口全是按 `act_id`（单个收藏集）设计的：

| 接口 | 作用 |
| --- | --- |
| `x/vas/dlc_act/act/list?scene=1&site=<偏移>` | 列出**全部**收藏集（目录，约 20/页） |
| `x/vas/dlc_act/asset_bag?act_id=&lottery_id=&ruid=` | 我在**某一个**收藏集里的持有情况 |

`asset_bag` 返回的 `owned_item_cnt` / `total_item_cnt` 就是「我拥有几张 / 一共几张」，
但它必须指定 `act_id`。App 里那个「背包」页面也是先选收藏集再展示的。

也就是说，**「找出我拥有哪些收藏集」只能把整个目录逐个查一遍**。
实测目录有 **1500+ 个**收藏集 —— 一千多次请求。

> ⚠️ 实测这么做**会触发 B 站风控**：扫描完约 1561 个之后，
> 该系列接口开始返回 `412 Precondition Failed`，且几分钟内不会恢复。
> 这不是理论风险，是实际发生过的。

## 所以设计成两条路

| 模式 | 命令 | 请求量 | 作用 |
| --- | --- | --- | --- |
| **刷新**（默认） | `pnpm anime:sync --provider bilibili` | = 你拥有的收藏集数（十几个） | 更新已有收藏集的进度与卡牌 |
| **全量扫描** | 同上加 `--scan-collections` | 1500+ | 发现**新**抽到的收藏集 |

首次必须跑一次全量扫描；之后日常同步走刷新就够了，又快又不会触发风控。

```bash
# 第一次：把所有收藏集找出来（慢，且可能被风控，偶尔跑一次即可）
pnpm anime:sync --provider bilibili --scan-collections

# 之后：只刷新已知的那些
pnpm anime:sync --provider bilibili
```

### ⚠️ 刷新是「合并」而不是「替换」

这点很关键：刷新模式下每个收藏集是一次独立请求，一旦被风控，
大部分请求会失败。如果拿这次的结果直接覆盖快照，
**那些没查成功的收藏集就被静默删掉了** —— 一次刷新清空大半。

所以按 `actId` 合并：查成功的用新数据，查失败的保留旧数据，
并在日志里告诉你有多少个没查成功。

## 配置

`src/config/animeConfig.ts` 的 `providers.bilibili.collections`：

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | `boolean` | `true` | 是否同步收藏集 |
| `maxItems` | `number` | `60` | 页面上最多展示几个（读取侧截断） |
| `file` | `string` | `bilibili-collections.json` | 快照文件名 |

## 数据流

```
1. 目录      GET x/vas/dlc_act/act/list?scene=1&site=<偏移>       （全量扫描才走）
                → { data: { list: [{ act_id, act_name, act_pic, lottery_id, ... }], is_more, site } }

2. 持有情况  GET x/vas/dlc_act/asset_bag?act_id=&lottery_id=&ruid=
                → { data: { owned_item_cnt, total_item_cnt, item_list, act_y_img, ... } }

3. 两边合成一条扁平记录 → normalizeCollection() 清洗 → 快照
```

几个实现细节：

- **并发压到 3、每条之间留 120ms**：这一块本来就请求多，再猛冲只会更快触发风控。
- **`lottery_id` 可以传 0**，实测不影响返回。
- **卡面图不做本地化**：一个收藏集动辄十几张卡，全下载收益很低，
  而这些图是公开可直连的。

## 页面怎么展示

- 收藏集按「我拥有的卡牌数」从多到少排。
- 每张卡下面的 `card_scarcity` 用来标稀有度：`>= 80` 标「大隐藏」、
  `>= 60` 标「小隐藏」。阈值随活动变化，所以只用来打标记和配色，不做硬性判断 ——
  认不出来就当普通卡。

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/data/bilibili.ts` | `BilibiliCollection` / `BilibiliCollectionCard` 类型 + 兜底数据 |
| `src/utils/bilibili/normalize.ts` | `normalizeCollection()` / `parseCollectionSnapshot()` |
| `src/utils/bilibili-data.ts` | `getCollections()` |
| `src/pages/collections.astro` | `/collections/` 页面 |
| `scripts/anime/providers/bilibili.mjs` | `fetchBilibiliCollections()` |
| `scripts/anime/sync.mjs` | `syncCollections()`（合并语义在这里） |

---

# 五、视频门面嵌入

## 语法

```md
::bilibili{bvid="BV1GJ411x7h7" part=1 title="视频标题"}
```

| 参数 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- |
| `bvid` | 是 | — | 视频 BV 号，形如 `BV1GJ411x7h7` |
| `p` / `part` | 否 | `1` | 分 P 序号，两种写法等价 |
| `title` | 否 | BV 号 | 卡片上显示的标题 |
| `preload` | 否 | `none` | `none` 点击才加载；`auto` 快滚到视口时提前加载 |

> 不支持 `av` 号。把 av 转 BV 需要额外的算法，而真正需要兼容的场景极少，
> 写错了会被明确地降级成纯文本（见下）。

## 为什么叫「门面」（facade）

生成的 HTML 里**只有**：

```html
<figure class="bili-facade" data-bilibili data-bilibili-bvid="BV1GJ411x7h7" …>
  <div class="bili-facade__stage">
    <button data-bilibili-activate aria-label="视频标题"> ▶ </button>
  </div>
  <figcaption>…</figcaption>
</figure>
```

**没有 iframe、没有 `player.bilibili.com`、没有第三方脚本。**
所以在读者点击播放之前，这个页面和 B 站之间没有任何数据往来 ——
没有 Cookie、没有 IP 泄漏、没有第三方 JS。

点击后才由 `src/utils/bilibili.ts` 创建 iframe。那次创建是唯一的第三方请求，
而且是读者自己主动触发的。

## 参数写错会怎样

`::bilibili{}` 的参数不合法（BV 号位数不对、`p` 不是正整数……）时，
`src/plugins/markdown/remark-bilibili.mjs` 会把它**还原成普通文本**。

不这么做的话，组件会返回 `null` 让这一块直接消失 —— 作者看不到任何提示，
只会发现「我明明写了视频，页面上却什么都没有」。

## 安全

播放器 URL 用 `URLSearchParams` 构造（不用字符串拼接），
并且在**激活时会重新校验** `data-*` 属性。原因是 DOM 是可篡改的
（浏览器插件、XSS 注入、控制台手改），而 iframe 的 `src` 一旦被改成
任意地址就成了开放重定向 / 钓鱼的跳板。

iframe 还带上了 `referrerpolicy="strict-origin-when-cross-origin"`，
只向 B 站暴露来源域名，不带完整路径。

## 与直接写 `<iframe>` 的对比

| | `::bilibili{}` | 手写 `<iframe>` |
| --- | --- | --- |
| 打开页面就连 B 站 | 否 | 是 |
| 访客 IP 被记录 | 点击后 | 总是 |
| 首屏带宽 | 0 | 每个视频一份播放器 |
| 参数校验 | 有 | 无 |
| 写法 | 一行 | 一坨 |

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/plugins/markdown/core/bilibili.mjs` | 参数校验 + URL 生成（纯函数，三层共用） |
| `src/plugins/markdown/remark-bilibili.mjs` | 把非法指令还原成文本 |
| `src/plugins/rehype-component-bilibili.mjs` | 渲染静态门面 |
| `src/utils/bilibili.ts` | 客户端激活逻辑 |
| `src/styles/bilibili.css` | 样式 |
| `astro.config.mjs` | 注册 remark / rehype 插件 |
| `src/layouts/Layout.astro` | 挂载激活脚本（含 Swup 换页重绑） |
