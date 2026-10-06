# 标签：侧栏只放一部分，全部标签在 /tags/

## 为什么要拆

文章一多，标签就会涨到几十个。全部铺在左侧栏那张小卡片里会有两个后果：

1. 左栏被撑得比正文还长，首页首屏几乎全被标签占满；
2. 想找某个标签时，在一堆按钮里翻反而更难找。

所以现在的分工是：

- **左侧栏**：只放最热（或字母序最前）的 N 个，底部给一个「查看全部标签」入口；
- **`/tags/` 页面**：完整列表，带文章数，字号随热度缩放，可选按首字母分组。

## 配置

`src/config.ts`：

```ts
export const tagsConfig: TagsConfig = {
  sidebarLimit: 12,        // 左侧栏最多显示几个标签；0 = 不限制（全部显示）
  sidebarSort: "count",    // 左栏排序：count 按文章数 / name 按字母
  pageSort: "count",       // /tags/ 页面排序
  pageGroupByLetter: false,// /tags/ 页面是否按首字母分组
  showCount: true,         // 标签后面是否显示文章数
  cloudSizing: true,       // /tags/ 页面字号是否随文章数缩放
  description: "",         // /tags/ 页面说明；留空用内置多语言文案
};
```

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `sidebarLimit` | `number` | `12` | 左侧栏显示上限。**设为 0 就退回「左栏显示全部标签」的旧行为** |
| `sidebarSort` | `"count" \| "name"` | `"count"` | 左栏排序。`count` 让最有代表性的标签先露出来 |
| `pageSort` | `"count" \| "name"` | `"count"` | `/tags/` 页面排序 |
| `pageGroupByLetter` | `boolean` | `false` | 按首字母分组。中文标签会全落到「其它」一组，所以默认关 |
| `showCount` | `boolean` | `true` | 标签后面显示文章数 |
| `cloudSizing` | `boolean` | `true` | 字号按文章数在 0.95rem ~ 1.35rem 之间线性插值 |
| `description` | `string` | `""` | `/tags/` 页面顶部说明 |

排序在文章数相同时都会退化成字母序，保证**每次构建结果一致**
（否则同样的内容可能生成顺序不同的 HTML，diff 里全是噪声）。

## 关联文件

| 文件 | 作用 |
| --- | --- |
| `src/components/widget/Tags.astro` | 左侧栏标签卡片：截断 + 「查看全部标签」入口 |
| `src/pages/tags.astro` | `/tags/` 总览页 |
| `src/utils/content-utils.ts` | `getTagList()`：统计每个标签下的文章数 |
| `src/utils/url-utils.ts` | `getTagUrl()`：标签链接的唯一出口 |

## 标签链接指向哪里

本站不为每个标签单独生成路由。`getTagUrl()` 返回的是：

```
/archive/?tag=<编码后的标签名>
```

归档页（`src/components/ArchivePanel.svelte`）读取这个查询参数并在客户端过滤。

这样「标签」只有一种落地方式：不用为几十个标签各生成一个页面，
也不会出现「标签页和归档页筛选结果不一致」的问题。

> 想改成 `/tags/<标签>/` 这样的独立路由，只需要替换 `getTagUrl()`
> 这一个函数 —— 它是标签系统与路由之间唯一的接缝。

## 其它入口

`/tags/` 也挂在了导航栏的「Others」下拉里（`LinkPreset.Tags`），
见 `src/constants/link-presets.ts` 与 `src/config.ts` 的 `navBarConfig`。

## 空状态

一个标签都没有时，左栏不显示「查看全部标签」入口
（`remaining > 0` 才显示），`/tags/` 页面显示内置的空状态文案。

## 无障碍

每个标签链接都带 `aria-label`，形如「查看带有 X 标签的全部文章」，
用读屏软件浏览时不会只听到一串孤零零的标签名。
