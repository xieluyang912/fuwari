/**
 * 番剧（追番）页面与 Bilibili 数据源配置。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  「零额外负担」与双平面模型
 * ─────────────────────────────────────────────────────────────────────────────
 *  - local 模式：完全离线，直接使用 `src/data/anime.ts` 的手写数据；
 *  - snapshot 模式（默认）：读取构建期抓取、清洗后的本地 JSON 快照
 *    （`src/data/anime-snapshots/<provider>.json`）；
 *  - 对外部接口的请求**只**发生在显式执行 `pnpm anime:sync` 时。
 *    页面渲染与 `astro build` 全程不碰网络 —— 这既是性能考虑，
 *    也是因为构建环境常常没有外网，把网络请求放进构建会变得很脆；
 *  - 私密凭据（B 站 SESSDATA）只通过环境变量注入同步进程，
 *    既不进前端代码，也不进快照文件（sync 脚本里有敏感串扫描兜底）。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  【用法】
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. 填好下面 providers.bilibili.vmid（你的 B 站数字 UID）；
 *  2. 执行 `pnpm anime:sync --provider bilibili` 生成快照；
 *  3. 正常 `pnpm build` 即可，页面会读那份快照。
 *
 *  追番列表若设为私密，接口会返回 code 53013 / -401，
 *  此时需要在项目根目录的 `.env` 里写 `BILI_SESSDATA="你的SESSDATA"`。
 *  ⚠️ `.env` 必须在 .gitignore 里，绝不能提交。
 *
 *  ⚠️ 本文件会被 `scripts/anime/sync.mjs` 用 Node 直接 import
 *     （Node 24 的类型擦除），所以这里的 import 必须带 `.ts` 扩展名，
 *     也不能出现 enum / namespace 这类需要真正编译的语法。
 */

import type { AnimeItem } from "../data/anime.ts";
import type {
	AnimeConfig,
	AnimeFallbackKind,
	AnimeProvider,
	AnimeSourceKind,
	ResolvedAnimeOptions,
} from "../types/animeConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const animeConfig: AnimeConfig = withUserConfig("anime", {
	/** 是否启用番剧页；false 时导航入口同步隐藏（投币区也一起消失） */
	enable: true,
	/** 页面标题。留空用内置多语言文案 */
	title: "B 站",
	/** 页面说明。留空用内置多语言文案 */
	description:
		"我在 B 站追的番，以及最近投过币的视频。数据由 pnpm anime:sync 在构建前抓取。",

	/** 主数据源 */
	source: {
		kind: "snapshot",
		provider: "bilibili",
	},

	/** 快照缺失/损坏时的降级策略：回退本地手写数据，保证页面不白屏 */
	fallback: {
		kind: "local",
	},

	providers: {
		bilibili: {
			enable: true,
			// 你的 B 站数字 UID（就是个人空间地址 space.bilibili.com/<这一串>）
			vmid: "3546912602982411",
			sessdataEnv: "BILI_SESSDATA",
			cover: {
				mode: "local", // local 站内下载缓存（推荐，无防盗链问题）| remote | none
				useWebp: true, // 交给 B 站 CDN 裁成 220x280 的 webp，省流量
			},
			request: {
				pageSize: 30, // 单页大小（B 站上限 50）
				maxItems: 300, // 最多抓多少条
				minDelayMs: 300, // 请求间隔，防限流
			},
			/**
			 * 「我最近投币的视频」。
			 *
			 * 走的是另一个接口（x/space/coin/video），不需要登录，
			 * 但要求你的「投币视频」可见性设为公开 —— 否则返回 code 53013。
			 * 在 B 站 App/网页的「隐私设置」里可以调。
			 */
			coins: {
				enable: true,
				maxItems: 12, // 页面上最多展示多少条
				pageSize: 20, // 单页请求条数
				file: "bilibili-coins.json", // 快照文件名
			},
			/**
			 * 「我的粉丝勋章」（对应独立的 /medals/ 页面）。
			 *
			 * ⚠️ 这块**必须配置 SESSDATA**，没有别的办法：
			 *    查询勋章墙的接口在 api.live.bilibili.com 上，
			 *    匿名访问一律返回 `-101 账号未登录`（实测没有任何参数可以绕过）。
			 *
			 *    所以要在项目根目录建 .env（已在 .gitignore 里）写：
			 *      BILI_SESSDATA="你的 SESSDATA"
			 *    然后执行 `pnpm anime:sync --provider bilibili`。
			 */
			medals: {
				enable: true,
				maxItems: 120, // 最多保留多少枚（读取侧截断，改完重新构建即可，不用重新同步）
				file: "bilibili-medals.json", // 快照文件名
			},
			/**
			 * 「我的数字收藏集」（对应独立的 /collections/ 页面）。
			 *
			 * ⚠️ 是 B 站装扮体系里的付费数字卡牌收藏集，**不是收藏夹**。
			 *    也需要 SESSDATA。
			 *
			 * ⚠️ 代价说明：B 站没有「列出我拥有哪些收藏集」的接口，
			 *    只能按 act_id 逐个查，而目录有 1500+ 个。
			 *    所以默认只刷新快照里已知的那些（几十个请求以内，很快），
			 *    想发现新抽到的收藏集要显式执行：
			 *      pnpm anime:sync --provider bilibili --scan-collections
			 *    全量扫描请求量大、实测会触发 B 站风控（返回 412），偶尔跑一次即可。
			 */
			collections: {
				enable: true,
				maxItems: 60, // 页面上最多展示几个（读取侧截断）
				file: "bilibili-collections.json", // 快照文件名
			},
		},
	},

	snapshot: {
		directory: "src/data/anime-snapshots",
		staleAfterDays: 30,
		keepLastValid: true, // 抓到空列表时不覆盖已有的有效快照
	},
});

/** 快照文件名只允许这些字符，防止 `file: "../../etc/passwd"` 这类路径穿越 */
const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.json$/;

/**
 * 校验并归一化番剧配置。
 *
 * 页面侧只认这个函数的返回值，这样「非法配置怎么处理」就只有一处定义：
 *   - 快照目录里出现 `..` → 退回默认目录（防路径穿越）
 *   - `file` 名字不合法 → 退回 `<provider>.json`
 *   - 指定了 provider 但 file 填成了另一家的 json → 自动纠正
 */
export function resolveAnimeOptions(config: AnimeConfig): ResolvedAnimeOptions {
	const enable = Boolean(config.enable);
	const fallback: AnimeFallbackKind =
		config.fallback?.kind === "empty" ? "empty" : "local";

	const rawDirectory = config.snapshot?.directory;
	const directory =
		typeof rawDirectory === "string" &&
		rawDirectory.trim() &&
		!rawDirectory.includes("..")
			? rawDirectory.trim().replace(/[\\/]+$/, "")
			: "src/data/anime-snapshots";

	const rawStaleDays = config.snapshot?.staleAfterDays;
	const staleAfterDays =
		typeof rawStaleDays === "number" &&
		Number.isFinite(rawStaleDays) &&
		rawStaleDays > 0
			? Math.floor(rawStaleDays)
			: 30;

	const keepLastValid = config.snapshot?.keepLastValid ?? true;

	const rawProvider = config.source?.provider;
	const provider: AnimeProvider | undefined =
		rawProvider === "bilibili" || rawProvider === "bangumi"
			? rawProvider
			: undefined;

	const rawFile = config.source?.file?.trim();
	const fileLooksWrong =
		(provider === "bilibili" && rawFile === "bangumi.json") ||
		(provider === "bangumi" && rawFile === "bilibili.json");

	let file: string | undefined;
	if (rawFile && SAFE_FILENAME_PATTERN.test(rawFile) && !fileLooksWrong) {
		file = rawFile;
	} else if (provider) {
		file = `${provider}.json`;
	}

	// 只有真的解析出一个文件才敢说自己是快照模式
	const kind: AnimeSourceKind =
		config.source?.kind === "snapshot" && file ? "snapshot" : "local";

	// ── 投币视频 ──
	const rawCoins = config.providers?.bilibili?.coins;
	const coinFile =
		rawCoins?.file && SAFE_FILENAME_PATTERN.test(rawCoins.file.trim())
			? rawCoins.file.trim()
			: "bilibili-coins.json";
	const rawCoinMax = rawCoins?.maxItems;
	const coinMaxItems =
		typeof rawCoinMax === "number" &&
		Number.isFinite(rawCoinMax) &&
		rawCoinMax > 0
			? Math.floor(rawCoinMax)
			: 12;

	// ── 数字收藏集 ──
	const rawCollections = config.providers?.bilibili?.collections;
	const collectionFile =
		rawCollections?.file &&
		SAFE_FILENAME_PATTERN.test(rawCollections.file.trim())
			? rawCollections.file.trim()
			: "bilibili-collections.json";
	const rawCollectionMax = rawCollections?.maxItems;
	const collectionMaxItems =
		typeof rawCollectionMax === "number" &&
		Number.isFinite(rawCollectionMax) &&
		rawCollectionMax > 0
			? Math.floor(rawCollectionMax)
			: 60;

	// ── 粉丝勋章 ──
	const rawMedals = config.providers?.bilibili?.medals;
	const medalFile =
		rawMedals?.file && SAFE_FILENAME_PATTERN.test(rawMedals.file.trim())
			? rawMedals.file.trim()
			: "bilibili-medals.json";
	const rawMedalMax = rawMedals?.maxItems;
	const medalMaxItems =
		typeof rawMedalMax === "number" &&
		Number.isFinite(rawMedalMax) &&
		rawMedalMax > 0
			? Math.floor(rawMedalMax)
			: 60;

	return Object.freeze({
		enable,
		source: Object.freeze({
			kind,
			...(provider ? { provider } : {}),
			...(file ? { file } : {}),
		}),
		fallback,
		snapshot: Object.freeze({
			directory,
			staleAfterDays,
			keepLastValid,
		}),
		coins: Object.freeze({
			// 番剧页整个关掉时投币区自然也不显示
			enable: enable && (rawCoins?.enable ?? false),
			file: coinFile,
			maxItems: coinMaxItems,
		}),
		medals: Object.freeze({
			// 勋章也有独立页面，同样只看自己的开关
			enable: rawMedals?.enable ?? false,
			file: medalFile,
			maxItems: medalMaxItems,
		}),
		collections: Object.freeze({
			enable: rawCollections?.enable ?? false,
			file: collectionFile,
			maxItems: collectionMaxItems,
		}),
	});
}

export const resolvedAnimeOptions: ResolvedAnimeOptions =
	resolveAnimeOptions(animeConfig);

export type { AnimeItem };
