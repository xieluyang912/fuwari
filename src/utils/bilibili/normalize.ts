/**
 * 投币视频条目的校验与归一化。
 *
 * 和追番一样，外部接口返回的内容一律视为不可信输入：字段可能缺失、
 * 类型可能不对，封面链接可能是 `javascript:`。同步脚本会先洗一遍再落盘，
 * 页面侧读快照时再洗一遍 —— 两道关卡，因为快照文件是可以被人手改的。
 *
 * 归一化失败的条目返回 null，由调用方过滤掉。
 */

import type {
	BilibiliCollection,
	BilibiliCollectionCard,
	BilibiliFanMedal,
	BilibiliGuardLevel,
	BilibiliVideo,
} from "../../data/bilibili.ts";

function getText(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

function toCount(value: unknown): number | undefined {
	const num = toFiniteNumber(value);
	if (num === null || num < 0) return undefined;
	return Math.floor(num);
}

/**
 * 只放行 https 与站内相对路径的媒体地址。
 *
 * 这条是安全边界而不是格式偏好：`javascript:` / `data:` 之类的伪协议
 * 一旦进了 `<img src>` 就是可执行的注入点。
 * `http://` 与 `//host/x` 会被升级成 https，而不是直接丢弃 ——
 * B 站接口返回的封面常常是 http。
 */
export function sanitizeMediaUrl(value: unknown): string | undefined {
	const raw = getText(value);
	if (!raw) return undefined;
	if (raw.startsWith("/")) return raw;
	if (raw.startsWith("//")) return `https:${raw}`;
	if (raw.startsWith("https://")) return raw;
	if (raw.startsWith("http://")) return raw.replace("http://", "https://");
	return undefined;
}

/** 外链只允许 https，并且必须是 B 站的域名 */
export function sanitizeBilibiliLink(value: unknown): string | undefined {
	const raw = getText(value);
	const upgraded = raw.startsWith("//")
		? `https:${raw}`
		: raw.replace(/^http:\/\//, "https://");
	if (!upgraded.startsWith("https://")) return undefined;
	try {
		const host = new URL(upgraded).host;
		// 白名单：只有 B 站自己的域名才放行，
		// 免得接口被篡改时把访客引到站外
		if (!/(^|\.)(bilibili\.com|b23\.tv)$/.test(host)) return undefined;
	} catch {
		return undefined;
	}
	return upgraded;
}

/**
 * 把时间字段统一成 ISO 字符串。
 *
 * ⚠️ 必须同时接受两种输入，否则归一化就不是幂等的：
 *
 *   - **接口原始值**：Unix 秒时间戳（`time: 1790786133`）
 *   - **已经归一化过的值**：ISO 字符串（`coinedAt: "2026-09-30T16:35:33.000Z"`）
 *
 * 为什么会在同一条数据上先后遇到两种：同步脚本先把原始数据归一化再落盘，
 * 页面侧读快照时又会归一化一遍（防止有人手工改快照）。
 * 如果这里只认数字，第二遍就会把 `coinedAt` 读成 `NaN` 然后丢掉 ——
 * **不报错、不崩溃，只是所有时间字段静静消失**，排序和日期显示一起失灵。
 */
function toIsoTime(value: unknown): string | undefined {
	if (value === undefined || value === null || value === "") return undefined;

	const numeric = toFiniteNumber(value);
	if (numeric !== null) {
		// 正整数当 Unix 秒；超过 1e12 的按毫秒处理（兼容有人手工填毫秒）
		if (numeric <= 0) return undefined;
		const date = new Date(numeric > 1e12 ? numeric : numeric * 1000);
		return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
	}

	// 非数字：当成日期字符串（ISO 等）解析
	if (typeof value === "string") {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
	}

	return undefined;
}

/** 简介：去掉 HTML 标签与实体，压缩空白，限长 */
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
	return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

/**
 * 把一条原始数据洗成 BilibiliVideo。
 * @returns 没有合法 BV 号或没有标题时返回 null
 */
export function normalizeBilibiliVideo(raw: unknown): BilibiliVideo | null {
	if (!raw || typeof raw !== "object") return null;
	const item = raw as Record<string, unknown>;

	const bvid = getText(item.bvid);
	const title = getText(item.title);
	// BV 号是去重主键，也是拼链接的唯一依据，没有它这条就没意义
	if (!/^BV[1-9A-HJ-NP-Za-km-z]{10}$/.test(bvid) || !title) return null;

	const owner =
		item.author && typeof item.author === "object"
			? (item.author as Record<string, unknown>)
			: item.owner && typeof item.owner === "object"
				? (item.owner as Record<string, unknown>)
				: item.upper && typeof item.upper === "object"
					? (item.upper as Record<string, unknown>)
					: null;
	const authorName = getText(owner?.name);

	// 两套计数结构合并成一份
	const statsRaw =
		item.stats && typeof item.stats === "object"
			? (item.stats as Record<string, unknown>)
			: null;
	const cntRaw =
		item.cnt_info && typeof item.cnt_info === "object"
			? (item.cnt_info as Record<string, unknown>)
			: null;

	const stats = {
		view: toCount(statsRaw?.view ?? cntRaw?.play),
		danmaku: toCount(statsRaw?.danmaku ?? cntRaw?.danmaku),
		like: toCount(statsRaw?.like ?? cntRaw?.thumb_up),
		coin: toCount(statsRaw?.coin),
		favorite: toCount(statsRaw?.favorite ?? cntRaw?.collect),
	};

	// stats 里全是 undefined 时就没必要留一个空对象
	const hasStats = Object.values(stats).some((v) => v !== undefined);

	const link =
		sanitizeBilibiliLink(item.link) ??
		`https://www.bilibili.com/video/${bvid}/`;

	return {
		bvid,
		title,
		cover: sanitizeMediaUrl(item.cover),
		author: authorName
			? { mid: getText(owner?.mid) || undefined, name: authorName }
			: undefined,
		duration: toCount(item.duration),
		publishedAt: toIsoTime(item.publishedAt ?? item.pubdate ?? item.pubtime),
		coinedAt: toIsoTime(item.coinedAt ?? item.time),
		coins: toCount(item.coins),
		stats: hasStats ? stats : undefined,
		category: getText(item.category ?? item.tnamev2 ?? item.tname) || undefined,
		description: sanitizeDescription(item.description ?? item.intro),
		link,
	};
}

/**
 * 排序：按「我操作的时间」从新到旧。
 *
 * 目前只有投币列表在用，排序依据是 `coinedAt`（我投币的时间）。
 *
 * 刻意不用视频的发布时间排 —— 我完全可能在今天给一个五年前的老视频投币/收藏，
 * 按发布时间排的话它会沉到列表底部，而这些列表看的就是**我什么时候操作的**。
 */
export function sortBilibiliVideos(items: BilibiliVideo[]): BilibiliVideo[] {
	const actionTime = (item: BilibiliVideo): number => {
		const iso = item.coinedAt;
		return iso ? new Date(iso).getTime() : 0;
	};

	return [...items].sort((a, b) => {
		const timeA = actionTime(a);
		const timeB = actionTime(b);
		if (timeA !== timeB) return timeB - timeA;
		return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
	});
}

/** 按 bvid 去重，保留先出现的那条 */
export function dedupeBilibiliVideos(items: BilibiliVideo[]): BilibiliVideo[] {
	const seen = new Set<string>();
	const result: BilibiliVideo[] = [];
	for (const item of items) {
		if (seen.has(item.bvid)) continue;
		seen.add(item.bvid);
		result.push(item);
	}
	return result;
}

/**
 * 解析投币快照，兼容两种格式：
 *   A. 标准封套 `{ schemaVersion: 1, kind: "coins", fetchedAt, items: [...] }`
 *   B. 裸数组 `[ ... ]`（手工拷贝）
 * @returns 解析不出来时返回 null
 */
export function parseCoinSnapshot(content: string): {
	items: BilibiliVideo[];
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

	const items: BilibiliVideo[] = [];
	for (const entry of rawItems) {
		const item = normalizeBilibiliVideo(entry);
		if (item) items.push(item);
	}

	const normalized = sortBilibiliVideos(dedupeBilibiliVideos(items));

	if (Array.isArray(parsed)) return { items: normalized };

	const envelope = parsed as Record<string, unknown>;
	return {
		items: normalized,
		fetchedAt: getText(envelope.fetchedAt) || undefined,
		accountRef: getText(envelope.accountRef) || undefined,
	};
}

/* ==========================================================================
 * 数字收藏集（装扮体系里的「收藏集」，不是收藏夹）
 * ========================================================================== */

/**
 * 把一条收藏集原始数据洗成 BilibiliCollection。
 *
 * 数据来自两步：目录接口给名称/封面/链接，`asset_bag` 给「我拥有几张卡」。
 * 同步脚本已经把两步的结果合并成了一条扁平记录，这里只做校验与清洗。
 *
 * @returns 没有 actId 或没有名称时返回 null
 */
export function normalizeCollection(raw: unknown): BilibiliCollection | null {
	if (!raw || typeof raw !== "object") return null;
	const item = raw as Record<string, unknown>;

	const actId = toIdString(item.actId ?? item.act_id);
	const name = getText(item.name ?? item.act_name);
	if (!actId || !name) return null;

	const ownedCards: BilibiliCollectionCard[] = [];
	const rawCards = Array.isArray(item.ownedCards)
		? item.ownedCards
		: Array.isArray(item.item_list)
			? item.item_list
			: [];

	for (const entry of rawCards) {
		const card = normalizeCollectionCard(entry);
		if (card) ownedCards.push(card);
	}

	return {
		actId,
		lotteryId: toIdString(item.lotteryId ?? item.lottery_id) || undefined,
		name,
		cover: sanitizeMediaUrl(item.cover ?? item.act_pic),
		banner: sanitizeMediaUrl(item.banner ?? item.act_y_img),
		description: sanitizeDescription(item.description ?? item.act_desc),
		link:
			sanitizeBilibiliLink(item.link ?? item.act_link) ??
			`https://www.bilibili.com/h5/mall/digital-card/home?act_id=${actId}`,
		ownedCount: toCount(item.ownedCount ?? item.owned_item_cnt) ?? 0,
		totalCount: toCount(item.totalCount ?? item.total_item_cnt) ?? 0,
		// 稀有度高的排前面，同稀有度按名字，保证构建结果稳定
		ownedCards: ownedCards.sort(
			(a, b) =>
				(b.scarcity ?? 0) - (a.scarcity ?? 0) ||
				a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
		),
	};
}

/**
 * 把一张卡牌洗成 BilibiliCollectionCard。
 *
 * `asset_bag` 返回的 `item_list` 每一项都套着 `card_item`，卡面信息在
 * `card_item.card_type_info` 里。但这一层结构在不同活动上偶有出入，
 * 所以下面按「card_type_info → card_asset_info → card_item 本身」逐级兜底。
 */
function normalizeCollectionCard(raw: unknown): BilibiliCollectionCard | null {
	if (!raw || typeof raw !== "object") return null;
	const entry = raw as Record<string, unknown>;

	const cardItem =
		entry.card_item && typeof entry.card_item === "object"
			? (entry.card_item as Record<string, unknown>)
			: entry;

	const info = [
		cardItem.card_type_info,
		cardItem.card_asset_info,
		cardItem,
	].find(
		(x) =>
			x &&
			typeof x === "object" &&
			(getText((x as Record<string, unknown>).name) ||
				getText((x as Record<string, unknown>).card_name)),
	) as Record<string, unknown> | undefined;

	if (!info) return null;

	const name = getText(info.name) || getText(info.card_name);
	if (!name) return null;

	return {
		cardTypeId: toIdString(info.id ?? info.card_type_id) || undefined,
		name,
		image: sanitizeMediaUrl(info.img ?? info.image ?? info.card_img),
		scarcity: toCount(info.scarcity ?? info.card_scarcity),
		isNew: toCount(info.is_new_tag) === 1,
	};
}

/**
 * 解析收藏集快照，兼容两种格式：
 *   A. 标准封套 `{ schemaVersion: 1, kind: "collections", fetchedAt, items: [...] }`
 *   B. 裸数组 `[ ... ]`
 * @returns 解析不出来时返回 null
 */
export function parseCollectionSnapshot(content: string): {
	items: BilibiliCollection[];
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

	const items: BilibiliCollection[] = [];
	for (const entry of rawItems) {
		const collection = normalizeCollection(entry);
		if (collection) items.push(collection);
	}

	// 收集得越多的排前面，其次按名字
	const sorted = items.sort(
		(a, b) =>
			b.ownedCount - a.ownedCount ||
			a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
	);

	if (Array.isArray(parsed)) return { items: sorted };

	const envelope = parsed as Record<string, unknown>;
	return {
		items: sorted,
		fetchedAt: getText(envelope.fetchedAt) || undefined,
		accountRef: getText(envelope.accountRef) || undefined,
	};
}

/** 把秒数格式化成 `4:05` / `1:02:33`；时长未知时返回 null */
export function formatDuration(seconds: number | undefined): string | null {
	if (seconds === undefined || seconds <= 0) return null;
	const total = Math.floor(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/* ==========================================================================
 * 粉丝勋章
 * ========================================================================== */

/**
 * 把十进制整数颜色转成 `#RRGGBB`。
 *
 * 勋章墙接口有两套颜色字段：老的是十进制整数（`medal_color_start = 6067854`），
 * 新的是带透明度的 8 位十六进制字符串（`v2_medal_color_start = "#5762A799"`）。
 * 新的优先，因为它才是 B 站当前界面真正用的配色（含透明度），
 * 老的只作为兜底。
 */
export function decimalToHexColor(value: unknown): string | undefined {
	const num = toFiniteNumber(value);
	if (num === null || num < 0) return undefined;
	// 取低 24 位，避免接口偶尔给出的异常大数字拼出超长色值
	const hex = Math.floor(num % 0x1000000)
		.toString(16)
		.padStart(6, "0");
	return `#${hex.toUpperCase()}`;
}

/** 规范化 `#RRGGBB` / `#RRGGBBAA`（也容忍不带 # 和大小写混写） */
export function sanitizeHexColor(value: unknown): string | undefined {
	const raw = getText(value);
	if (!raw) return undefined;
	const match = raw.match(/^#?([0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?)$/);
	if (!match) return undefined;
	return `#${match[1].toUpperCase()}`;
}

/** 大航海等级：只认 0~3，其它值一律当 0（无） */
function toGuardLevel(value: unknown): BilibiliGuardLevel {
	const num = toFiniteNumber(value);
	if (num === 1 || num === 2 || num === 3) return num;
	return 0;
}

/**
 * 把「身份类」字段转成字符串。
 *
 * ⚠️ 不能直接用 `getText()`：接口里的 mid / 勋章 ID 是**数字**，
 *    而 getText 只认字符串 —— 用它会把 `target_id: 178429408` 读成空串，
 *    结果整条勋章数据被判为「没有主播 mid」丢掉。
 *    这个坑很安静：不报错，只是所有勋章都消失。
 */
function toIdString(value: unknown): string {
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return "";
}

/**
 * 把一条勋章墙原始数据洗成 BilibiliFanMedal。
 *
 * 字段来自两个嵌套对象，以 `medal_info` 为主、
 * `uinfo_medal` 补齐颜色与 ID（它是新版字段所在的地方）。
 *
 * @returns 没有勋章名或没有主播 mid 时返回 null
 */
export function normalizeFanMedal(raw: unknown): BilibiliFanMedal | null {
	if (!raw || typeof raw !== "object") return null;
	const item = raw as Record<string, unknown>;

	const medalInfo =
		item.medal_info && typeof item.medal_info === "object"
			? (item.medal_info as Record<string, unknown>)
			: null;
	const uinfo =
		item.uinfo_medal && typeof item.uinfo_medal === "object"
			? (item.uinfo_medal as Record<string, unknown>)
			: null;

	/*
	 * 幂等性：这个函数既要认**接口原始数据**（字段散在 medal_info / uinfo_medal
	 * 两个嵌套对象里），也要认**它自己的输出**（扁平结构）。
	 *
	 * 因为数据会走两遍：同步脚本先归一化再落盘，页面侧读快照时又归一化一次。
	 * 只认嵌套结构的话，第二遍会找不到 medal_info 而把每一枚勋章都丢掉 ——
	 * 表现就是「同步成功了，页面却一枚勋章都没有」。
	 *
	 * 所以下面每个字段都按「原始嵌套 → v2 嵌套 → 扁平」的顺序取值。
	 */
	const medalName =
		getText(medalInfo?.medal_name) ||
		getText(uinfo?.name) ||
		getText(item.medalName);

	const targetId =
		toIdString(medalInfo?.target_id) ||
		toIdString(uinfo?.ruid) ||
		toIdString(item.targetId);

	// 勋章名和主播 mid 缺任何一个，这枚勋章都没法展示
	if (!medalName || !targetId) return null;

	const targetName =
		getText(item.target_name) || getText(item.targetName) || targetId;

	return {
		targetId,
		targetName,
		targetIcon:
			sanitizeMediaUrl(item.target_icon) ?? sanitizeMediaUrl(item.targetIcon),
		link:
			sanitizeBilibiliLink(item.link) ??
			`https://space.bilibili.com/${targetId}`,
		liveStatus: toCount(item.live_status) ?? toCount(item.liveStatus),
		medalName,
		level: toCount(medalInfo?.level ?? uinfo?.level ?? item.level) ?? 0,
		medalId:
			toIdString(medalInfo?.medal_id) ||
			toIdString(uinfo?.id) ||
			toIdString(item.medalId) ||
			undefined,
		intimacy:
			toCount(medalInfo?.intimacy) ??
			toCount(uinfo?.score) ??
			toCount(item.intimacy),
		nextIntimacy:
			toCount(medalInfo?.next_intimacy) ?? toCount(item.nextIntimacy),
		todayFeed: toCount(medalInfo?.today_feed) ?? toCount(item.todayFeed),
		dayLimit: toCount(medalInfo?.day_limit) ?? toCount(item.dayLimit),
		wearing:
			medalInfo?.wearing_status !== undefined
				? toCount(medalInfo.wearing_status) === 1
				: Boolean(item.wearing),
		guardLevel: toGuardLevel(
			medalInfo?.guard_level ?? uinfo?.guard_level ?? item.guardLevel,
		),
		// 新的 v2 字段优先，老的十进制次之，最后认已有的十六进制字符串
		colorStart:
			sanitizeHexColor(uinfo?.v2_medal_color_start) ??
			decimalToHexColor(medalInfo?.medal_color_start ?? uinfo?.color_start) ??
			sanitizeHexColor(item.colorStart),
		colorEnd:
			sanitizeHexColor(uinfo?.v2_medal_color_end) ??
			decimalToHexColor(medalInfo?.medal_color_end ?? uinfo?.color_end) ??
			sanitizeHexColor(item.colorEnd),
		colorBorder:
			sanitizeHexColor(uinfo?.v2_medal_color_border) ??
			decimalToHexColor(medalInfo?.medal_color_border ?? uinfo?.color_border) ??
			sanitizeHexColor(item.colorBorder),
		colorText:
			sanitizeHexColor(uinfo?.v2_medal_color_text) ??
			sanitizeHexColor(item.colorText),
	};
}

/**
 * 排序：佩戴中的排最前，然后按等级、再按亲密度从高到低。
 *
 * 「佩戴中」放最前是因为那是用户当前的选择 —— B 站自己的勋章墙也是这么排的。
 */
export function sortFanMedals(items: BilibiliFanMedal[]): BilibiliFanMedal[] {
	return [...items].sort((a, b) => {
		if (a.wearing !== b.wearing) return a.wearing ? -1 : 1;
		if (a.level !== b.level) return b.level - a.level;
		const intimacyA = a.intimacy ?? 0;
		const intimacyB = b.intimacy ?? 0;
		if (intimacyA !== intimacyB) return intimacyB - intimacyA;
		return a.medalName.localeCompare(b.medalName, "en", {
			sensitivity: "base",
		});
	});
}

/** 按「主播 mid + 勋章 ID」去重，保留先出现的那条 */
export function dedupeFanMedals(items: BilibiliFanMedal[]): BilibiliFanMedal[] {
	const seen = new Set<string>();
	const result: BilibiliFanMedal[] = [];
	for (const item of items) {
		const key = `${item.targetId}:${item.medalId ?? item.medalName}`;
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(item);
	}
	return result;
}

/**
 * 解析勋章快照，兼容两种格式：
 *   A. 标准封套 `{ schemaVersion: 1, kind: "medals", fetchedAt, items: [...] }`
 *   B. 裸数组 `[ ... ]`
 * @returns 解析不出来时返回 null
 */
export function parseMedalSnapshot(content: string): {
	items: BilibiliFanMedal[];
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

	const items: BilibiliFanMedal[] = [];
	for (const entry of rawItems) {
		const medal = normalizeFanMedal(entry);
		if (medal) items.push(medal);
	}

	const normalized = sortFanMedals(dedupeFanMedals(items));

	if (Array.isArray(parsed)) return { items: normalized };

	const envelope = parsed as Record<string, unknown>;
	return {
		items: normalized,
		fetchedAt: getText(envelope.fetchedAt) || undefined,
		accountRef: getText(envelope.accountRef) || undefined,
	};
}
