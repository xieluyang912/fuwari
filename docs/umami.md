# Umami 访问统计

[Umami](https://umami.is) 是一个开源的、可自托管的网站分析服务。
本站集成了它的两层能力，**默认全部关闭**：

| 能力 | 作用 | 需要填 |
| --- | --- | --- |
| 公开分享统计 | 侧栏「访问统计」卡片读取 Umami 分享链接暴露的公开数据 | `shareUrl` |
| 访问采集 | 加载 Umami 官方脚本，采集本站访客行为 | `websiteId` + `scriptUrl` |

两层是独立的：只想在页面上展示统计、不想采集访客，就只填 `shareUrl`。

---

## 1. 配置文件

`src/config/umamiConfig.ts`：

```ts
export const umamiConfig = withUserConfig("umami", {
  enable: false,      // 全局总开关
  shareUrl: "",       // Umami 分享链接（必填）
  websiteId: "",      // Umami Website ID
  scriptUrl: "",      // Umami 采集脚本 URL
});
```

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | `boolean` | `false` | 全局总开关。`false` 时不加载任何运行时脚本、不留 DOM、不增加包体积 |
| `shareUrl` | `string` | `""` | Umami 分享链接。缺失时整体不生效 |
| `websiteId` | `string` | `""` | Website ID。与 `scriptUrl` **同时**填写才启用访问采集 |
| `scriptUrl` | `string` | `""` | 采集脚本 URL。与 `websiteId` 成对生效 |

### 解析规则

```
enable: false                      → 整体不生效（零请求、零 DOM、零包体积）
shareUrl 为空                      → 整体不生效
只填 shareUrl                      → 仅启用公开分享统计展示
shareUrl + websiteId + scriptUrl   → 分享统计 + 访问采集同时启用
只填 websiteId 或只填 scriptUrl    → 不加载采集脚本（填一个注定上报失败的脚本没有意义）
```

判断逻辑集中在 `resolveUmamiOptions()` 里，所有消费方共用同一个结论，
不会出现「脚本加载了但卡片没渲染」这种半开状态。

### 推荐：写到用户配置里

不想改主题自带的默认值，可以写在 `src/user/user-config.ts`：

```ts
export const userConfigOverrides: Readonly<Record<string, unknown>> = {
  umami: {
    enable: true,
    shareUrl: "https://umami.example.com/share/xxxxxxxx",
    websiteId: "your-website-id",
    scriptUrl: "https://umami.example.com/script.js",
  },
};
```

合并规则是**对象递归合并、数组整体替换**（见 `src/utils/config-overlay.ts`）。
这样升级主题时，`src/config/umamiConfig.ts` 可以整份替换而不会覆盖你的配置。

---

## 2. 开启步骤

1. **部署 Umami**（自托管或官方云服务），创建网站，拿到 `websiteId`
   与采集脚本地址（通常是 `https://<你的实例>/script.js`）。
2. **开启分享链接**：在该网站的设置里打开「分享 URL」，
   得到形如 `https://umami.example.com/share/xxxxxxxx` 的链接。
3. **填写配置**（见上）。
4. **重新构建部署**。

支持以下四种分享链接：

```
https://umami.example.com/share/<shareId>                  自部署在根路径
https://umami.example.com/analytics/share/<shareId>        自部署在子路径
https://cloud.umami.is/analytics/us/share/<shareId>        Cloud（带区域段）
https://cloud.umami.is/share/<shareId>                     Cloud 短链（无区域段）
```

### ⚠️ 最后一种最容易踩

Umami 文档里给的是带区域段的写法，但**控制台里复制出来的实际是短链**。
短链路径里没有区域段，而真正的接口在 `/analytics/<region>/api`：

```text
GET https://cloud.umami.is/api/share/<id>               → 404
GET https://cloud.umami.is/analytics/us/api/share/<id>  → 200 ✓
```

症状很迷惑人：分享链接在浏览器里能正常打开、能看到图表，
但站内卡片永远是 `--`，控制台也不报错（请求失败被静默收敛成 `null` 了）。

所以 `src/utils/umami.ts` 不是只推一个地址，而是维护一个**候选列表按顺序探测**：

```
1. {origin}{prefix}/api                      最常见
2. {origin}{prefix}/analytics/us/api         Cloud 短链 - 美区
3. {origin}{prefix}/analytics/eu/api         Cloud 短链 - 欧区
```

第一个 404 就试下一个，命中即停。链接里已经带 `/analytics/` 时不会再追加后两条，
免得拼出 `/analytics/us/analytics/us/api` 这种一看就不可能命中的地址。

自部署实例如果加了反向代理，请确保 `/api/*` 能正常透传。

---

## 3. ⚠️ 域名绑定要求

**Umami 后台为该网站配置的 Website Domain，必须与站点实际部署域名一致。**

本站在 `astro.config.mjs` 的 `site` 字段里声明域名
（当前是 `https://007912.xyz`），改域名时这两处要一起改。

跨域或未授权域名上的采集脚本会被 Umami 实例的策略**静默拦截**：
脚本能加载、控制台不报错，但后台一条数据都不会有。
排查时打开浏览器开发者工具的 Network 面板，
看 `/api/send` 请求的响应状态 —— 被拦截时它不会返回 2xx。

---

## 4. 实现说明

### 访问采集

`src/components/system/UmamiRuntime.astro` 会插入：

```html
<script async src="<scriptUrl>" data-website-id="<websiteId>"></script>
```

Umami 官方脚本自己处理 SPA 跳转（它劫持了 `history.pushState`），
所以本站用 Swup 做无刷新跳转也不会漏记。

### 公开分享统计

Umami 的分享链接是一套**只读的公开接口**，不需要 API Key：

```
GET {apiBase}/share/{shareId}
    → { websiteId, token, ... }

GET {apiBase}/websites/{websiteId}/stats
        ?startAt=0&endAt=<按 5 分钟对齐的当前时间>
    Header: x-umami-share-token: <token>
    Header: x-umami-share-context: 1
    → { pageviews, visitors, visits, bounces?, totaltime? }
```

本站自己实现了这套读取（`src/utils/umami.ts`），没有引入第三方 npm 包。

> `x-umami-share-context: 1` 是 Umami Cloud 要求的前置校验头，缺了会 401。
> 自托管实例不校验它，带上也无害。

数字有**两条来源**，先到先得、后到的覆盖：

1. **构建期**（`src/utils/umami.ts`）：在 Node 里抓一次，直接写进 HTML。
   好处是纯静态产物首屏就有真实数值；访客端即使被 CORS 或网络问题挡住，
   页面上仍然有内容，不会是一片 `--`。请求有 5 秒超时，失败不影响构建。
   同一次构建里只真正请求一次（Promise 缓存），不会每个页面都打一遍 Umami。
2. **运行时**（`src/utils/umami-client.ts`）：在浏览器里再拉一次，
   成功就把数字换成实时的（带千分位），失败就保留构建期那一份。

两端**共用同一份接口代码**。这不是为了少写几行，而是因为「接口地址怎么推导、
返回的 JSON 怎么解析」如果各写一份，迟早会漂移成
「构建期能出数、运行时出不来」这种极难排查的状态。

卡片把分享链接写在自己的 `data-umami-share-url` 属性上（而不是硬编码在脚本里），
所以想把它挪到左栏或文章里，直接挪组件即可，脚本不用改。

Umami Cloud 的接口回的是 `access-control-allow-origin: *` /
`access-control-allow-headers: *`，所以浏览器端那次刷新不会被 CORS 拦住。
自托管实例如果前面挂了反向代理，注意别把这两个头抹掉。

### 三条常见症状对照

| 现象 | 原因 |
| --- | --- |
| 卡片完全不存在 | `enable: false`（默认）或 `shareUrl` 为空 |
| 卡片在，但永远是 `--` | 接口地址推导错（多半是 Cloud 短链）或实例不可达 |
| 卡片有数字，但一直是 0 | 没装采集脚本，或 Umami 后台的 Website Domain 与站点域名不一致 |

### 零额外负担

关闭时（默认）：

- 不产生任何外部网络请求；
- 不输出任何 DOM；
- 脚本写在组件的模板里，Astro 只输出真正渲染到的组件所带的脚本 ——
  组件渲染出空内容，那段脚本**连字节都不会产生**。

---

## 5. 展示位置

侧栏「访问统计」卡片（`src/components/widget/UmamiStats.astro`），
在 `src/config.ts` 的 `sidebarConfig.widgets` 里用 `"umami"` 控制：

```ts
export const sidebarConfig: SidebarConfig = {
  enable: true,
  widgets: [
    "site-stats",
    "umami",      // ← 访问统计卡片；umamiConfig 未开启时不渲染
    "calendar",
    "categories",
  ],
};
```

它固定显示三个指标：浏览量（pageviews）、访客数（visitors）、访问次数（visits）。

> 卡片上的数字用等宽字形 + 固定最小宽度，从 `--` 换成 `12,345` 时不会把
> 左边的文字挤得来回跳。
