/**
 * Umami（开源自托管分析服务）统计配置。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  两个能力层，彼此独立
 * ─────────────────────────────────────────────────────────────────────────────
 *  ① 公开分享统计：侧栏等位置读取 Umami「分享链接」暴露的公开访问数据。
 *     —— 只需要填 shareUrl。
 *
 *  ② 访问采集：加载 Umami 官方脚本，采集本站在访客浏览器里的行为。
 *     —— 需要同时填 websiteId 与 scriptUrl，缺一不可。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  解析规则（见下方 resolveUmamiOptions）
 * ─────────────────────────────────────────────────────────────────────────────
 *  enable: false                        → 整体不生效（零请求、零 DOM、零包体积）
 *  shareUrl 为空                        → 整体不生效
 *  只填 shareUrl                        → 仅启用公开分享统计展示
 *  shareUrl + websiteId + scriptUrl     → 分享统计 + 访问采集同时启用
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  ⚠️ 域名绑定要求
 * ─────────────────────────────────────────────────────────────────────────────
 *  Umami 后台为该网站配置的 Website Domain，必须与站点实际部署域名一致
 *  （本站的域名写在 `astro.config.mjs` 的 `site` 字段里）。
 *  跨域或未授权域名上的采集脚本会被 Umami 实例的策略**静默拦截**：
 *  脚本加载成功、也不报错，但后台一条数据都不会有。
 *  排查时先看浏览器 Network 里 `/api/send` 请求的响应状态。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  开启步骤
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. 部署 Umami（自托管或官方云服务），创建网站，拿到 websiteId 与采集脚本地址；
 *  2. 在该网站的设置里开启「分享 URL」，得到形如
 *     https://umami.example.com/share/xxxxxxxx 的链接；
 *  3. 填写本文件（或更推荐：写在 `src/user/user-config.ts` 里覆盖，
 *     这样升级主题时不会和默认值冲突）；
 *  4. 重新构建部署。
 *
 *  更详细的说明见 `docs/umami.md`。
 */

import type {
	ResolvedUmamiOptions,
	UmamiConfig,
} from "../types/umamiConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const umamiConfig: UmamiConfig = withUserConfig("umami", {
	/** 全局总开关：false 时完全不加载统计运行时脚本与 DOM */
	enable: true,
	/**
	 * Umami 分享链接（必填）。
	 *
	 * ⚠️ Umami Cloud 的分享短链形如 https://cloud.umami.is/share/<id>，
	 *    路径里没有区域段，真正的接口在 /analytics/<region>/api。
	 *    utils/umami.ts 会自动探测 us / eu 两个区域，不用手写。
	 */
	shareUrl: "https://cloud.umami.is/share/h8TzKUF7u6BBAuUs",
	/**
	 * Umami Website ID；与 scriptUrl 同时填写时启用访问采集。
	 *
	 * ⚠️ 访问采集现在是**开启**的：只有装了采集脚本，Umami 后台才会有数据，
	 *    卡片上的数字才不会永远是 0。不想采集访客行为（只想展示已有统计）时，
	 *    把下面这两行清空成 "" 即可 —— 那样就只剩公开分享统计，
	 *    页面上不会出现任何第三方脚本。
	 */
	websiteId: "0790be4e-7b1b-4b75-8b54-2f6df3899060",
	/** Umami 采集脚本 URL；与 websiteId 同时填写时启用访问采集 */
	scriptUrl: "https://cloud.umami.is/script.js",
});

/**
 * 解析并校验 Umami 配置。
 *
 * 把「该不该生效」的判断集中在这一个函数里，好处是所有消费方
 * （Layout 里的运行时、侧栏统计卡片、文档生成）看到的结论永远一致 ——
 * 不会出现「脚本加载了但卡片没渲染」这种半开状态。
 *
 * @returns 解析后的选项；未启用或关键参数缺失时返回 `null`
 */
export function resolveUmamiOptions(config: UmamiConfig): ResolvedUmamiOptions {
	if (!config.enable) {
		return null;
	}

	const shareUrl = config.shareUrl?.trim();
	// shareUrl 是公开分享统计的唯一入口，也是「这个功能要生效」的最低要求
	if (!shareUrl) {
		return null;
	}

	const websiteId = config.websiteId?.trim() || undefined;
	const scriptUrl = config.scriptUrl?.trim() || undefined;

	return {
		shareUrl,
		websiteId,
		scriptUrl,
		// 两项都齐备才加载采集脚本：只填一项时 Umami 官方脚本无法正常上报，
		// 与其加载一个注定失败的脚本，不如干脆不加载
		collect: Boolean(websiteId && scriptUrl),
	};
}

export type { ResolvedUmamiOptions };
