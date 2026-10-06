/**
 * Umami 统计配置类型。
 *
 * 对应 `src/config/umamiConfig.ts`。
 */

export type UmamiConfig = {
	/** 全局总开关：false 时不加载运行时脚本，也不产生任何 DOM 与网络请求 */
	enable: boolean;
	/** Umami 分享链接（必填）。缺失时整体不生效 */
	shareUrl: string;
	/** Umami Website ID，与 scriptUrl 成对填写时才启用访问采集 */
	websiteId?: string;
	/** Umami 采集脚本 URL，与 websiteId 成对填写时才启用访问采集 */
	scriptUrl?: string;
};

/**
 * 解析后的 Umami 运行时选项。
 *
 * - 未启用 / shareUrl 缺失 → `null`（整体不生效）
 * - 只解析出 shareUrl → 仅公开分享统计
 * - websiteId 与 scriptUrl 同时有效 → 公开分享统计 + 访问采集
 */
export type ResolvedUmamiOptions = {
	shareUrl: string;
	websiteId?: string;
	scriptUrl?: string;
	/** shareUrl + websiteId + scriptUrl 三者齐备，会加载官方采集脚本 */
	collect: boolean;
} | null;
