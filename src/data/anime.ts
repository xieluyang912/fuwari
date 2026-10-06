/**
 * 番剧（追番）数据模型与本地兜底数据。
 *
 * ── 为什么类型放在 data/ 而不是 types/ ───────────────────────────────
 * 这份数据结构同时是「同步脚本的产物格式」和「页面消费的输入格式」，
 * 把它和默认数据放一起，改字段时两边的距离最短。
 *
 * ── 数据从哪来 ──────────────────────────────────────────────────────
 *  1. `animeConfig.source.kind === "local"`（默认之外的选择）
 *     → 直接用下面这份 `animeData` 手写数据，零网络、零构建脚本。
 *  2. `animeConfig.source.kind === "snapshot"`（推荐）
 *     → 读 `src/data/anime-snapshots/bilibili.json`，
 *       那是 `pnpm anime:sync` 在构建前显式抓取 B 站追番接口生成的快照。
 *     快照缺失/损坏时会回退到这里的 `animeData`（见 utils/anime-data.ts）。
 *
 * 页面**永远不会**在运行时请求 B 站接口：所有外部请求都只发生在
 * 显式执行 `pnpm anime:sync` 的那一次。
 */

/** 追番状态。B 站接口只产出前三种，后两种是给本地手写数据预留的 */
export type AnimeStatus =
	| "watching" // 在看
	| "completed" // 看过
	| "planned" // 想看
	| "onHold" // 搁置
	| "dropped"; // 抛弃

/** 单条追番记录（同步脚本产出的规范化格式） */
export type AnimeItem = {
	/** 番剧名（必填，空标题的条目会在同步阶段被丢弃） */
	title: string;
	/** 追番状态 */
	status: AnimeStatus;
	/** 评分 0 ~ 10，没有评分时为 0 */
	rating?: number;
	/** 年份，形如 "2022" */
	year?: string;
	/** 题材标签，最多 6 个 */
	genres?: string[];
	/** 观看到第几话（total 为 0 表示总集数未知） */
	progress?: { watched: number; total: number };
	/** 封面。local 模式下是站内路径 /assets/anime/covers/bili_xxx.webp */
	cover?: string;
	/** B 站番剧主页链接 */
	link?: string;
	/** 简介 */
	description?: string;
	/** 制作方 / 地区 */
	studio?: string;
	/** 来源标识，用于去重与溯源 */
	identity?: {
		provider: "local" | "bangumi" | "bilibili";
		seasonId?: string;
		sourceId?: string;
	};
};

/**
 * 本地兜底数据。
 *
 * 快照模式（默认）下，抓取失败或快照缺失时页面会退回到这里。
 * 留空数组也可以：页面会显示一个友好的空状态，而不是白屏。
 * 想手动维护一份「必看清单」，直接往下面加条目即可。
 */
export const animeData: AnimeItem[] = [];
