/**
 * Umami「公开分享」接口的读取工具。
 *
 * 同一份实现同时被两端使用：
 *   - 构建期：`components/widget/UmamiStats.astro` 在 Node 里抓一次，把数字写进 HTML；
 *   - 运行时：`utils/umami-client.ts` 在浏览器里再抓一次，把数字刷新成实时的。
 *
 * 放在一个文件里是刻意的：接口 URL 怎么推导、返回的 JSON 怎么解析，
 * 两端必须完全一致 —— 各写一份迟早会漂移成「构建期能出数、运行时出不来」
 * 这种极难排查的状态。
 *
 * 本文件只依赖 `fetch` / `AbortController` / `URL` / `URLSearchParams`，
 * 这些在 Node 18+ 与现代浏览器里都有，所以两端可以直接共用。
 *
 * ── 接口 ─────────────────────────────────────────────────────────────
 *   1. GET {apiBase}/share/{shareId}
 *        → { websiteId, token, ... }
 *   2. GET {apiBase}/websites/{websiteId}/stats
 *            ?startAt=0&endAt=<按 5 分钟对齐的当前时间>[&path=eq.<路径>]
 *        Header: x-umami-share-token: <token>
 *        → { pageviews, visitors, visits, bounces?, totaltime? }
 *
 * ⚠️ apiBase 不能只用「/share/ 之前的路径 + /api」去推。
 *    Umami Cloud 的分享短链是 https://cloud.umami.is/share/<id>，
 *    路径里**没有**区域段；但真正的接口在
 *    https://cloud.umami.is/analytics/us/api/...
 *    按前者推出来的是 https://cloud.umami.is/api/...，会直接 404，
 *    表现就是「分享链接明明能打开，卡片却永远是 --」。
 *    所以这里维护一个候选列表，按顺序探测，第一个成功的胜出。
 */

import type { ResolvedUmamiOptions } from "../types/umamiConfig";

/** 公开分享接口返回的统计结果（只取卡片要用的三个字段） */
export type UmamiStats = {
	pageviews: number;
	visitors: number;
	visits: number;
};

/** 单次请求超时（毫秒）。构建期等太久会拖慢整次构建 */
const REQUEST_TIMEOUT_MS = 5000;

/** Umami 的 endAt 按 5 分钟对齐，与官方前端行为一致 */
const END_AT_ALIGN_MS = 300000;

/** 把当前时间对齐到 5 分钟 */
function alignedNow(): number {
	return Math.floor(Date.now() / END_AT_ALIGN_MS) * END_AT_ALIGN_MS;
}

/**
 * 解析分享链接，得到 shareId 与**若干个候选** API 根地址（按可能性排序）。
 *
 * 支持的链接形态：
 *   https://umami.example.com/share/<id>                  → {origin}/api
 *   https://umami.example.com/analytics/share/<id>        → {origin}/analytics/api
 *   https://cloud.umami.is/analytics/us/share/<id>        → {origin}/analytics/us/api
 *   https://cloud.umami.is/share/<id>（短链，无区域段）    → 需要探测 /analytics/{us,eu}/api
 *
 * @returns 解析失败（不是合法 URL / 没有 /share/<id> 段）时返回 null
 */
export function parseUmamiShareUrl(
	shareUrl: string,
): { shareId: string; apiBases: string[] } | null {
	let url: URL;
	try {
		url = new URL(shareUrl);
	} catch {
		return null;
	}

	const segments = url.pathname.split("/");
	// 从后往前找最后一个 "share" 段：分享链接一定是 .../share/<shareId>
	const index = segments.lastIndexOf("share");
	if (index < 0) return null;

	const shareId = segments[index + 1];
	if (!shareId) return null;

	// "share" 之前的路径前缀要保留（自部署在子路径下 / Cloud 带区域段时用得到）
	const prefix = segments.slice(0, index).join("/");
	const origin = `${url.protocol}//${url.host}`;

	const candidates = [
		// 最常见的一种：自部署在根路径，或链接里已经带了完整的区域前缀
		`${origin}${prefix}/api`,
	];

	// Umami Cloud 的短链路径里没有区域段，真正的接口在 /analytics/<region>/api。
	// 只在链接本身没提过 /analytics/ 时才追加这两个候选，
	// 否则会拼出 /analytics/us/analytics/us/api 这种明显不可能命中的地址。
	if (!prefix.includes("/analytics/")) {
		candidates.push(
			`${origin}${prefix}/analytics/us/api`,
			`${origin}${prefix}/analytics/eu/api`,
		);
	}

	// 去重但保持顺序
	return { shareId, apiBases: [...new Set(candidates)] };
}

/** 带超时的 fetch + JSON 解析；任何异常都收敛成 null */
async function fetchJson(
	url: string,
	headers: Record<string, string>,
	timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Record<string, unknown> | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { headers, signal: controller.signal });
		if (!response.ok) return null;
		return (await response.json()) as Record<string, unknown>;
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

/** 把接口返回的数字字段收敛成有限非负数，防止 NaN 渗进页面 */
function toCount(value: unknown): number {
	// 新版 Umami 的统计接口有时返回 { value: n } 而不是裸数字
	const raw =
		value && typeof value === "object" && "value" in value
			? (value as { value: unknown }).value
			: value;
	const num = Number(raw);
	return Number.isFinite(num) && num >= 0 ? num : 0;
}

/**
 * 读取公开分享统计。
 *
 * @param shareUrl Umami 分享链接
 * @param path 可选。传了就是「该页面的统计」，不传是「整站统计」
 * @returns 全部候选地址都失败时返回 null（调用方负责降级，不要抛错）
 */
export async function fetchUmamiStats(
	shareUrl: string,
	path?: string,
): Promise<UmamiStats | null> {
	const parsed = parseUmamiShareUrl(shareUrl);
	if (!parsed) return null;

	const { shareId, apiBases } = parsed;

	// 第一步：逐个候选地址尝试换取 websiteId 与 share token。
	// 只有一个能成功，其余会 404 —— 这正是探测「区域段」的方式。
	for (const apiBase of apiBases) {
		const share = await fetchJson(`${apiBase}/share/${shareId}`, {});
		if (!share) continue;

		const websiteId =
			typeof share.websiteId === "string" ? share.websiteId : "";
		const token = typeof share.token === "string" ? share.token : "";
		// 没令牌说明这个分享无效或已过期，继续试下一个地址
		if (!websiteId || !token) continue;

		// 第二步：查统计
		const query = new URLSearchParams({
			startAt: "0",
			endAt: String(alignedNow()),
		});
		if (path) query.set("path", `eq.${path}`);

		const stats = await fetchJson(
			`${apiBase}/websites/${websiteId}/stats?${query.toString()}`,
			{
				"x-umami-share-token": token,
				// Umami Cloud 的前置校验会看这个头，缺了会 401
				"x-umami-share-context": "1",
			},
		);
		if (!stats) continue;

		return {
			pageviews: toCount(stats.pageviews),
			visitors: toCount(stats.visitors),
			visits: toCount(stats.visits),
		};
	}

	return null;
}

/*
 * 构建期缓存。
 *
 * Astro 会为每个页面各渲染一次组件；如果每次渲染都发一遍网络请求，
 * 一个有几十页的站点构建时就要打几十次 Umami。这里把 Promise 缓存住，
 * 同一个分享链接在一次构建里只真正请求一次。
 *
 * 缓存 Promise 而不是结果：并发的多个页面渲染会共享同一次请求。
 * 请求失败时把缓存删掉，避免后续页面直接复用这个 null
 * —— 也让「临时网络抖动」不会扩散到整次构建。
 */
const siteStatsCache = new Map<string, Promise<UmamiStats | null>>();

/**
 * 读取整站统计（带构建期缓存）。
 * 供侧栏统计卡片在构建时调用。
 */
export function getUmamiSiteStats(
	options: ResolvedUmamiOptions,
): Promise<UmamiStats | null> {
	if (!options) return Promise.resolve(null);

	const key = options.shareUrl;
	const cached = siteStatsCache.get(key);
	if (cached) return cached;

	const promise = fetchUmamiStats(options.shareUrl).then((result) => {
		if (!result) siteStatsCache.delete(key);
		return result;
	});

	siteStatsCache.set(key, promise);
	return promise;
}
