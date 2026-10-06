/**
 * 追番条目的校验与归一化。
 *
 * 外部接口返回的内容一律视为**不可信输入**：字段可能缺失、类型可能不对，
 * 描述里可能夹着 HTML，图片链接可能是 `javascript:`。同步脚本会把这些
 * 原始数据交给这里洗一遍再落盘，页面侧读快照时也会再洗一遍 —— 两道关卡，
 * 因为快照文件是可以被人手改的（比如你从别处拷贝一份 JSON 进来）。
 *
 * 归一化失败的条目返回 null，由调用方过滤掉，而不是抛错终止整次同步。
 */

import type { AnimeItem, AnimeStatus } from "../../data/anime.ts";

/** 允许的状态值（对外部输入做白名单，避免奇怪的字符串渗进页面） */
const STATUS_VALUES: readonly AnimeStatus[] = [
	"watching",
	"completed",
	"planned",
	"onHold",
	"dropped",
];

/**
 * 状态白名单校验，容忍 `onhold` / `ON_HOLD` 这类大小写与分隔符差异。
 */
export function normalizeStatus(value: unknown): AnimeStatus | null {
	if (typeof value !== "string") return null;
	const compact = value
		.trim()
		.toLowerCase()
		.replace(/[_\s-]/g, "");
	const map: Record<string, AnimeStatus> = {
		watching: "watching",
		completed: "completed",
		planned: "planned",
		onhold: "onHold",
		dropped: "dropped",
	};
	return map[compact] ?? null;
}

/** 把任意输入收敛成有限数字 */
function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function getText(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

/**
 * 只放行 https 与站内相对路径的媒体地址。
 *
 * 这条是安全边界而不是格式偏好：`javascript:` / `data:` 之类的伪协议
 * 一旦进了 `<img src>` 或 `<a href>` 就是可执行的注入点。
 * `http://` 与 `//host/x` 会被升级成 https，而不是直接丢弃 ——
 * B 站老接口返回的封面常常是 http。
 */
export function sanitizeMediaUrl(value: unknown): string | undefined {
	const raw = getText(value);
	if (!raw) return undefined;
	if (raw.startsWith("/")) return raw; // 站内静态资源
	if (raw.startsWith("//")) return `https:${raw}`;
	if (raw.startsWith("https://")) return raw;
	if (raw.startsWith("http://")) return raw.replace("http://", "https://");
	return undefined;
}

/** 外链只允许 https */
export function sanitizeExternalLink(value: unknown): string | undefined {
	const raw = getText(value);
	if (!raw) return undefined;
	if (raw.startsWith("https://")) return raw;
	if (raw.startsWith("http://")) return raw.replace("http://", "https://");
	return undefined;
}

/** 去掉 HTML 标签与实体，压缩空白，并限制长度 */
export function sanitizeDescription(value: unknown): string | undefined {
	const raw = getText(value);
	if (!raw) return undefined;

	const text = raw
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, " ")
		.trim();

	if (!text) return undefined;
	return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

/** 题材标签：去重、去 `#`、限长、最多 6 个 */
export function sanitizeGenres(value: unknown): string[] | undefined {
	const raw = Array.isArray(value)
		? value
		: typeof value === "string"
			? value.split(/[、,/\s]+/)
			: [];

	const seen = new Set<string>();
	const genres: string[] = [];
	for (const entry of raw) {
		const name =
			typeof entry === "string"
				? entry.trim()
				: getText((entry as { name?: unknown } | null)?.name);
		const cleaned = name.replace(/^#/, "").trim();
		if (!cleaned || cleaned.length > 30) continue;
		const key = cleaned.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		genres.push(cleaned);
		if (genres.length >= 6) break;
	}

	return genres.length > 0 ? genres : undefined;
}

/**
 * 把一条原始数据洗成 AnimeItem。
 * @returns 标题为空或状态非法时返回 null
 */
export function normalizeAnimeItem(raw: unknown): AnimeItem | null {
	if (!raw || typeof raw !== "object") return null;
	const item = raw as Record<string, unknown>;

	const title = getText(item.title);
	const status = normalizeStatus(item.status);
	if (!title || !status) return null;

	const ratingRaw = toFiniteNumber(item.rating);
	const rating =
		ratingRaw === null ? 0 : clamp(Math.round(ratingRaw * 10) / 10, 0, 10);

	// progress 既接受 { watched, total }，也接受一个裸数字
	let progress: AnimeItem["progress"];
	const rawProgress = item.progress;
	if (rawProgress && typeof rawProgress === "object") {
		const record = rawProgress as Record<string, unknown>;
		const watched = toFiniteNumber(record.watched);
		const total = toFiniteNumber(record.total);
		if (watched !== null) {
			const safeTotal = total !== null && total > 0 ? Math.floor(total) : 0;
			progress = {
				watched: clamp(
					Math.floor(watched),
					0,
					safeTotal > 0 ? safeTotal : Number.MAX_SAFE_INTEGER,
				),
				total: safeTotal,
			};
		}
	} else {
		const watched = toFiniteNumber(rawProgress);
		if (watched !== null)
			progress = { watched: Math.max(0, Math.floor(watched)), total: 0 };
	}

	const identityRaw =
		item.identity && typeof item.identity === "object"
			? (item.identity as Record<string, unknown>)
			: null;
	const identityProvider = getText(identityRaw?.provider);

	const normalized: AnimeItem = {
		title,
		status,
		rating,
		year: /^\d{4}$/.test(getText(item.year)) ? getText(item.year) : undefined,
		genres: sanitizeGenres(item.genres),
		progress,
		cover: sanitizeMediaUrl(item.cover),
		link: sanitizeExternalLink(item.link),
		description: sanitizeDescription(item.description),
		studio: getText(item.studio) || undefined,
		identity: identityRaw
			? {
					provider:
						identityProvider === "bilibili" || identityProvider === "bangumi"
							? identityProvider
							: "local",
					seasonId: getText(identityRaw.seasonId) || undefined,
					sourceId: getText(identityRaw.sourceId) || undefined,
				}
			: undefined,
	};

	return normalized;
}

/** 展示时的状态优先级：在看的排最前，抛弃的排最后 */
const STATUS_ORDER: Record<AnimeStatus, number> = {
	watching: 0,
	completed: 1,
	planned: 2,
	onHold: 3,
	dropped: 4,
};

/** 按「状态 → 年份倒序 → 标题」排序，保证每次构建的顺序一致 */
export function sortAnimeList(items: AnimeItem[]): AnimeItem[] {
	return [...items].sort((a, b) => {
		const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
		if (byStatus !== 0) return byStatus;

		const yearA = a.year ?? "";
		const yearB = b.year ?? "";
		if (yearA !== yearB) return yearB.localeCompare(yearA);

		return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
	});
}

/**
 * 解析快照文件内容，兼容两种历史格式：
 *   A. 标准封套 `{ schemaVersion: 1, provider, fetchedAt, items: [...] }`
 *   B. 裸数组 `[ ... ]`（早期格式 / 手工拷贝）
 * @returns 解析不出来时返回 null，由调用方决定降级
 */
export function parseAnimeSnapshot(content: string): {
	items: AnimeItem[];
	fetchedAt?: string;
	accountRef?: string;
} | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		return null;
	}

	const rawItems = Array.isArray(parsed)
		? parsed
		: parsed &&
				typeof parsed === "object" &&
				Array.isArray((parsed as { items?: unknown }).items)
			? (parsed as { items: unknown[] }).items
			: null;

	if (!rawItems) return null;

	const items: AnimeItem[] = [];
	for (const entry of rawItems) {
		const item = normalizeAnimeItem(entry);
		if (item) items.push(item);
	}

	if (Array.isArray(parsed)) {
		return { items: sortAnimeList(items) };
	}

	const envelope = parsed as Record<string, unknown>;
	return {
		items: sortAnimeList(items),
		fetchedAt: getText(envelope.fetchedAt) || undefined,
		accountRef: getText(envelope.accountRef) || undefined,
	};
}

export { STATUS_VALUES };
