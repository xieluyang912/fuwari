/**
 * 番剧（追番）模块配置类型。
 *
 * 对应 `src/config/animeConfig.ts`。
 *
 * 设计上遵循「零额外负担」：
 *   - 对外部接口的请求**只**发生在显式执行 `pnpm anime:sync` 时；
 *   - 页面渲染与 `astro build` 全程只读本地文件，不碰网络；
 *   - 私密凭据（如 B 站 SESSDATA）只通过环境变量注入同步进程，
 *     绝不进入前端代码，也绝不写进快照文件。
 */

import type { AnimeItem } from "../data/anime.ts";

/** 支持的外部数据源提供方 */
export type AnimeProvider = "bangumi" | "bilibili";

/** 主数据源类型：本地手写 / 构建期快照 */
export type AnimeSourceKind = "local" | "snapshot";

/** 快照不可用时的降级策略 */
export type AnimeFallbackKind = "local" | "empty";

/** 封面策略 */
export type AnimeCoverMode = "local" | "remote" | "none";

export interface AnimeSourceConfig {
	kind: AnimeSourceKind;
	/** 指定 provider（kind 为 "snapshot" 时建议指定） */
	provider?: AnimeProvider;
	/**
	 * 指定快照文件名（只允许 `[a-zA-Z0-9_-]+.json`）。
	 * 省略时按 `<provider>.json` 处理，也就是 `pnpm anime:sync` 的写入目标。
	 */
	file?: string;
}

export interface AnimeFallbackConfig {
	kind: AnimeFallbackKind;
}

/** 网络请求调优 */
export interface AnimeRequestOptions {
	/** 单页大小（B 站上限 50） */
	pageSize?: number;
	/** 最多抓多少条，防止过度抓取 */
	maxItems?: number;
	/** 请求间隔（毫秒），防止触发限流 */
	minDelayMs?: number;
}

export interface BilibiliProviderConfig {
	/** 是否启用 B 站同步能力 */
	enable: boolean;
	/** B 站数字 UID（vmid），必填 */
	vmid: string;
	/** 保存 SESSDATA 的环境变量名（只写键名，别把 token 写进仓库） */
	sessdataEnv?: string;
	/** 封面处理策略 */
	cover?: {
		mode: AnimeCoverMode;
		/** 是否使用 WebP（B 站 CDN 端处理，不占本地 CPU） */
		useWebp?: boolean;
	};
	request?: AnimeRequestOptions;
	/** 「我最近投币的视频」同步配置 */
	coins?: BilibiliCoinsConfig;
	/** 「我的粉丝勋章」同步配置 */
	medals?: BilibiliMedalsConfig;
	/** 「我的数字收藏集」同步配置 */
	collections?: BilibiliCollectionsConfig;
}

/**
 * 数字收藏集同步配置。
 *
 * ⚠️ 这里的「收藏集」是 B 站装扮体系里的付费数字卡牌产品，**不是收藏夹**。
 *    同样需要 SESSDATA。
 *
 * ⚠️ B 站没有「列出我拥有哪些收藏集」的接口，只能按 act_id 逐个查，
 *    而目录有 1500+ 个。所以默认只**刷新已知的**（几十个请求以内），
 *    想发现新收藏集要显式执行 `pnpm anime:sync --scan-collections`。
 */
export interface BilibiliCollectionsConfig {
	/** 是否同步数字收藏集 */
	enable: boolean;
	/** 页面上最多展示几个收藏集 */
	maxItems?: number;
	/** 快照文件名 */
	file?: string;
}

/** 粉丝勋章同步配置 */
export interface BilibiliMedalsConfig {
	/**
	 * 是否同步粉丝勋章。
	 *
	 * ⚠️ 这块**必须配置 `SESSDATA`**：查询勋章墙的接口
	 * （`api.live.bilibili.com/xlive/web-ucenter/user/MedalWall`）
	 * 匿名访问一律返回 `-101 账号未登录`，没有任何绕过的办法。
	 * 没配凭据时同步会跳过并打印提示，页面显示空状态。
	 */
	enable: boolean;
	/** 最多保留多少枚（按佩戴中 → 等级 → 亲密度排序后截断） */
	maxItems?: number;
	/** 快照文件名 */
	file?: string;
}

/** 投币视频同步配置 */
export interface BilibiliCoinsConfig {
	/**
	 * 是否同步投币列表。
	 *
	 * 注意这依赖 B 站空间接口 `x/space/coin/video`，它只在用户的
	 * 「投币视频」可见性为公开时才返回数据，否则返回 code 53013。
	 */
	enable: boolean;
	/** 最多保留多少条 */
	maxItems?: number;
	/** 单页请求条数 */
	pageSize?: number;
	/** 快照文件名（必须符合安全文件名白名单） */
	file?: string;
}

/** 快照存储策略 */
export interface AnimeSnapshotConfig {
	/** 快照目录，相对项目根目录 */
	directory: string;
	/** 超过这个天数就在构建日志里提醒该重新同步了 */
	staleAfterDays?: number;
	/** 抓取结果为空时是否保留上一份有效快照 */
	keepLastValid: boolean;
}

export interface AnimeConfig {
	/** 是否启用番剧页；关掉后导航入口一并隐藏 */
	enable: boolean;
	/** 页面标题（留空用内置多语言文案） */
	title: string;
	/** 页面说明（留空用内置多语言文案） */
	description: string;
	source: AnimeSourceConfig;
	fallback: AnimeFallbackConfig;
	providers: {
		bilibili: BilibiliProviderConfig;
	};
	snapshot: AnimeSnapshotConfig;
}

/** 版本化快照文件的封套格式 */
export interface AnimeSnapshot {
	schemaVersion: 1;
	provider: AnimeProvider;
	fetchedAt: string;
	accountRef: string;
	items: AnimeItem[];
}

/** 经校验与归一化后的运行时选项 */
export interface ResolvedAnimeOptions {
	enable: boolean;
	source: {
		kind: AnimeSourceKind;
		provider?: AnimeProvider;
		file?: string;
	};
	fallback: AnimeFallbackKind;
	snapshot: {
		directory: string;
		staleAfterDays: number;
		keepLastValid: boolean;
	};
	/** 投币视频：只填「要不要」和「读哪个文件」，目录/过期天数复用上面的 snapshot */
	coins: {
		enable: boolean;
		file: string;
		maxItems: number;
	};
	/** 粉丝勋章：同上 */
	medals: {
		enable: boolean;
		file: string;
		maxItems: number;
	};
	/** 数字收藏集：同上 */
	collections: {
		enable: boolean;
		file: string;
		maxItems: number;
	};
}
