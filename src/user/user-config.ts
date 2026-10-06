/**
 * 用户配置覆盖层。
 *
 * 这里把「主题默认值」和「你自己的改动」拆开存放，二者互不污染：
 *
 *   - 默认值（连同解释它的注释）留在 `src/config.ts` 与 `src/config/*Config.ts`，
 *     升级主题时可以整份替换，不会覆盖掉你的东西；
 *   - 你的覆盖写在本文件里，改完之后各配置会自动合并。
 *
 * 合并规则：**对象递归合并，数组整体替换**。
 * 数组不做逐项合并，因为 `sidebarConfig.widgets`、`profileConfig.links`
 * 这类清单的语义是「这就是我要的全部条目」——逐项合并会让「删掉一项」
 * 变得没法表达（只能靠填空值去顶掉，很别扭）。
 *
 * 用法示例（想改哪个领域就写哪个键，其余字段继续用默认值）：
 *
 * ```ts
 * export const userConfigOverrides: Readonly<Record<string, unknown>> = {
 *   umami: {
 *     enable: true,
 *     shareUrl: "https://umami.example.com/share/xxxxxxxx",
 *   },
 *   site: {
 *     title: "我的小站",
 *   },
 * };
 * ```
 *
 * 领域名就是 `withUserConfig("xxx", ...)` 的第一个参数，
 * 目前可用：`umami`。
 */

/** 领域名 -> 该领域的用户覆盖值（只写你想改的键）。 */
export const userConfigOverrides: Readonly<Record<string, unknown>> = {};
