/**
 * B 站视频的数据模型与本地兜底数据。
 *
 * 目前只有一种用途：记录「我最近投币的视频」，渲染在 /anime/ 页面上。
 *
 * ── 数据从哪来 ──────────────────────────────────────────────────────
 * `pnpm anime:sync --provider bilibili` 会顺带抓一次 B 站空间接口
 * （`x/space/coin/video`），把结果规范化后写到
 * `src/data/anime-snapshots/bilibili-coins.json`。
 *
 * 和追番一样，页面渲染与 `astro build` 全程不碰网络 ——
 * 数据在同步阶段就变成了一份本地 JSON。
 */

/** 视频作者（UP 主） */
export type BilibiliAuthor = {
	/** UP 主的 UID */
	mid?: string;
	/** UP 主昵称 */
	name: string;
};

/** 视频的公开计数 */
export type BilibiliVideoStats = {
	/** 播放量 */
	view?: number;
	/** 弹幕数 */
	danmaku?: number;
	/** 点赞数 */
	like?: number;
	/** 总投币数（所有人投的，不是我投的） */
	coin?: number;
	/** 收藏数 */
	favorite?: number;
};

/** 一条投币记录 */
export type BilibiliVideo = {
	/** BV 号，也是去重用的主键 */
	bvid: string;
	/** 视频标题 */
	title: string;
	/** 封面。local 模式下是站内路径 /assets/bilibili/covers/coin_xxx.webp */
	cover?: string;
	/** UP 主 */
	author?: BilibiliAuthor;
	/** 视频时长（秒） */
	duration?: number;
	/** 视频发布时间（ISO 字符串） */
	publishedAt?: string;
	/**
	 * **我**投币的时间（ISO 字符串）。
	 * 这是投币接口独有的字段，也是投币列表的排序依据 ——
	 * 用视频的发布时间排会得到完全不同的顺序。
	 */
	coinedAt?: string;
	/** 我投了几个币（通常是 1 或 2） */
	coins?: number;
	/** 视频计数 */
	stats?: BilibiliVideoStats;
	/** 分区名，例如「音乐」「电子竞技」 */
	category?: string;
	/** 简介 */
	description?: string;
	/** 视频在 B 站的地址 */
	link: string;
};

/**
 * 本地兜底数据。
 *
 * 快照缺失或抓取失败时页面会退回到这里。留空数组也可以：
 * 页面会显示一个友好的空状态 + 怎么把数据同步进来的提示，而不是白屏。
 */
export const coinVideosData: BilibiliVideo[] = [];

/* ==========================================================================
 * 粉丝勋章
 * ========================================================================== */

/** 大航海等级 */
export type BilibiliGuardLevel = 0 | 1 | 2 | 3;

/** 一枚粉丝勋章 */
export type BilibiliFanMedal = {
	/** 勋章对应的主播 mid */
	targetId: string;
	/** 主播昵称 */
	targetName: string;
	/** 主播头像 */
	targetIcon?: string;
	/** 主播空间地址 */
	link?: string;
	/** 直播间状态：0 未开播 / 1 直播中 / 2 轮播中 */
	liveStatus?: number;
	/** 勋章名（主播给自己粉丝团起的名字） */
	medalName: string;
	/** 勋章等级 */
	level: number;
	/** 勋章 ID */
	medalId?: string;
	/** 当前亲密度 */
	intimacy?: number;
	/** 升到下一级需要的亲密度 */
	nextIntimacy?: number;
	/** 今天已经获得的亲密度 */
	todayFeed?: number;
	/** 每日亲密度上限 */
	dayLimit?: number;
	/** 是否正在佩戴（佩戴中的会排在前面） */
	wearing: boolean;
	/** 大航海等级：0 无 / 1 总督 / 2 提督 / 3 舰长 */
	guardLevel: BilibiliGuardLevel;
	/** 勋章配色。接口给的是 8 位十六进制（带透明度），浏览器可以直接用 */
	colorStart?: string;
	colorEnd?: string;
	colorBorder?: string;
	colorText?: string;
};

/**
 * 粉丝勋章的本地兜底数据。
 *
 * ⚠️ 这块**只能靠带凭据的同步**：查询勋章墙的接口不接受匿名访问，
 *    必须带登录 Cookie（见 docs/bilibili.md「四、粉丝勋章」）。
 *    所以留空即可，快照缺失时页面显示的是「怎么配置」的提示。
 */
export const fanMedalsData: BilibiliFanMedal[] = [];

/* ==========================================================================
 * 数字收藏集（装扮体系里的「收藏集」）
 * ========================================================================== */

/**
 * ⚠️ 这里的「收藏集」不是「收藏夹」。
 *
 *   收藏夹（favorites）= 你收藏视频用的文件夹，在 space.bilibili.com/<mid>/favlist
 *   收藏集（collections）= B 站装扮体系里的付费数字卡牌产品，
 *                        入口在 App「我的 → 个性装扮 → 收藏集」，
 *                        网页版在 bilibili.com/h5/mall/digital-card/home
 *
 * 两者没有任何关系，接口、域名、数据模型都完全不同。
 */

/** 收藏集里的一张卡牌 */
export type BilibiliCollectionCard = {
	/** 卡牌 id */
	cardTypeId?: string;
	/** 卡牌名 */
	name: string;
	/** 卡面图片 */
	image?: string;
	/**
	 * 稀有度。数值越大越稀有，B 站自己的分档大致是：
	 * 40 普通 / 60 小隐藏 / 80 大隐藏（具体阈值随活动变化，所以只用来排序和配色）
	 */
	scarcity?: number;
	/** 是否本次新增的卡 */
	isNew?: boolean;
};

/** 一个收藏集，以及我在其中的持有情况 */
export type BilibiliCollection = {
	/** 收藏集活动 id */
	actId: string;
	/** 抽奖 id（打开收藏集详情要用） */
	lotteryId?: string;
	/** 收藏集名称 */
	name: string;
	/** 收藏集封面 */
	cover?: string;
	/** 收藏集详情页顶部大图 */
	banner?: string;
	/** 收藏集说明，接口给的通常是「已售份数 1 千+」这类文案 */
	description?: string;
	/** 在 B 站打开这个收藏集的地址 */
	link: string;
	/** 我拥有的卡牌数 */
	ownedCount: number;
	/** 这个收藏集一共有多少张卡 */
	totalCount: number;
	/** 我拥有的卡牌明细 */
	ownedCards: BilibiliCollectionCard[];
};

/**
 * 收藏集的本地兜底数据。
 *
 * ⚠️ 和勋章一样，这块**必须配 SESSDATA**，而且代价更高：
 *    B 站没有「列出我拥有哪些收藏集」的接口，只能把整个收藏集目录
 *    （实测 780+ 个）逐个查一遍，见 scripts/anime/providers/bilibili.mjs。
 *    所以留空即可，快照缺失时页面显示的是「怎么同步」的提示。
 */
export const collectionsData: BilibiliCollection[] = [];
