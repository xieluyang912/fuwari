enum I18nKey {
	home = "home",
	about = "about",
	archive = "archive",
	search = "search",

	tags = "tags",
	categories = "categories",
	recentPosts = "recentPosts",
	/** 文章页左侧栏「目录」卡片的标题 */
	toc = "toc",

	comments = "comments",

	untitled = "untitled",
	uncategorized = "uncategorized",
	noTags = "noTags",

	wordCount = "wordCount",
	wordsCount = "wordsCount",
	minuteCount = "minuteCount",
	minutesCount = "minutesCount",
	postCount = "postCount",
	postsCount = "postsCount",

	themeColor = "themeColor",

	lightMode = "lightMode",
	darkMode = "darkMode",
	systemMode = "systemMode",

	more = "more",

	author = "author",
	publishedAt = "publishedAt",
	license = "license",

	/* ======================================================================
	 * 以下为 Mizuki 风格功能新增的文案键
	 * 说明：这些键在部分语言文件里没有写，会由 translation.ts 自动回退到英文，
	 *      所以新增语言时不必每个文件都补齐。
	 * ==================================================================== */

	// ---- 导航栏下拉菜单 ----
	navLinks = "navLinks",
	navMy = "navMy",
	navAbout = "navAbout",
	navOthers = "navOthers",

	// ---- 站点统计 ----
	siteStats = "siteStats",
	siteStatsPostCount = "siteStatsPostCount",
	siteStatsCategoryCount = "siteStatsCategoryCount",
	siteStatsTagCount = "siteStatsTagCount",
	siteStatsTotalWords = "siteStatsTotalWords",
	siteStatsRunningDays = "siteStatsRunningDays",
	siteStatsDays = "siteStatsDays",
	siteStatsLastUpdate = "siteStatsLastUpdate",
	siteStatsDaysAgo = "siteStatsDaysAgo",

	// ---- 日历 ----
	calendar = "calendar",
	calendarJan = "calendarJan",
	calendarFeb = "calendarFeb",
	calendarMar = "calendarMar",
	calendarApr = "calendarApr",
	calendarMay = "calendarMay",
	calendarJun = "calendarJun",
	calendarJul = "calendarJul",
	calendarAug = "calendarAug",
	calendarSep = "calendarSep",
	calendarOct = "calendarOct",
	calendarNov = "calendarNov",
	calendarDec = "calendarDec",
	calendarMon = "calendarMon",
	calendarTue = "calendarTue",
	calendarWed = "calendarWed",
	calendarThu = "calendarThu",
	calendarFri = "calendarFri",
	calendarSat = "calendarSat",
	calendarSun = "calendarSun",
	calendarNoPost = "calendarNoPost",
	calendarBackToToday = "calendarBackToToday",
	/** 下面三个是给屏幕阅读器读的按钮名，界面上不显示 */
	calendarSelectMonthYear = "calendarSelectMonthYear",
	calendarPrevMonth = "calendarPrevMonth",
	calendarNextMonth = "calendarNextMonth",

	// ---- Others 里的特色页面 ----
	projects = "projects",
	projectsDesc = "projectsDesc",
	skills = "skills",
	skillsDesc = "skillsDesc",
	aiTools = "aiTools",
	aiToolsDesc = "aiToolsDesc",
	timeline = "timeline",
	timelineDesc = "timelineDesc",
	viewProject = "viewProject",
	viewSource = "viewSource",
	noContent = "noContent",

	/* ======================================================================
	 * 以下为「文章加密」功能新增的文案键
	 * 对应 src/components/misc/EncryptedContent.astro
	 * ==================================================================== */

	/** 密码框标题 */
	postPasswordTitle = "postPasswordTitle",
	/** 密码框下方的说明 */
	postPasswordDescription = "postPasswordDescription",
	/** 输入框的无障碍名 */
	postPasswordLabel = "postPasswordLabel",
	/** 输入框占位符 */
	postPasswordPlaceholder = "postPasswordPlaceholder",
	/** 显隐密码按钮：显示 / 隐藏 */
	postPasswordShow = "postPasswordShow",
	postPasswordHide = "postPasswordHide",
	/** 没输密码就点了解锁 */
	postPasswordRequired = "postPasswordRequired",
	/** 密码错误 */
	postPasswordInvalid = "postPasswordInvalid",
	/** 解锁按钮 / 正在解密 */
	postPasswordUnlock = "postPasswordUnlock",
	postPasswordUnlocking = "postPasswordUnlocking",
	/** 浏览器不支持 Web Crypto（http 访问时会出现） */
	postPasswordUnsupported = "postPasswordUnsupported",
	/** 列表卡片和 RSS 里，用来替换被藏起来的摘要 */
	postEncryptedSummary = "postEncryptedSummary",
	/** 文章页头部的小徽章 */
	postEncryptedBadge = "postEncryptedBadge",
	/** 列表卡片上锁图标的无障碍名 */
	postEncryptedLabel = "postEncryptedLabel",

	/* ======================================================================
	 * 以下为「标签总览页」功能新增的文案键
	 * 对应 src/pages/tags/index.astro 与 components/widget/Tags.astro
	 * ==================================================================== */

	/** 左侧栏标签卡片底部的「查看全部标签」入口 */
	viewAllTags = "viewAllTags",
	/** 左侧栏入口右侧的剩余数量提示，带 {count} 占位符 */
	tagsMoreCount = "tagsMoreCount",
	/** /tags/ 页面顶部的统计，形如「27 个标签 · 75 篇文章」，带 {tags} / {posts} 占位符 */
	tagsPageStats = "tagsPageStats",
	/** /tags/ 页面顶部的一句话说明（配置留空时使用） */
	tagsPageDescription = "tagsPageDescription",
	/** /tags/ 页面按首字母分组时，非字母开头的标签归到这一组 */
	tagsGroupOther = "tagsGroupOther",
	/** 全站一个标签都没有时显示的占位文案 */
	tagsEmpty = "tagsEmpty",
	/** 标签链接的无障碍名，带 {tag} 占位符 */
	tagsViewTagPosts = "tagsViewTagPosts",

	/* ======================================================================
	 * 以下为「Umami 访问统计」功能新增的文案键
	 * 对应 src/components/widget/UmamiStats.astro
	 * ==================================================================== */

	/** 侧栏统计卡片的标题 */
	umamiStats = "umamiStats",
	/** 浏览量（pageviews） */
	umamiPageviews = "umamiPageviews",
	/** 独立访客数（visitors） */
	umamiVisitors = "umamiVisitors",
	/** 访问次数（visits） */
	umamiVisits = "umamiVisits",

	/* ======================================================================
	 * 以下为「追番（Bilibili 同步）」功能新增的文案键
	 * 对应 src/pages/anime.astro
	 * ==================================================================== */

	/** 导航栏与页面标题 */
	anime = "anime",
	/** 页面顶部说明（animeConfig.description 留空时使用） */
	animeDesc = "animeDesc",
	/** 追番总数，带 {count} 占位符 */
	animeCount = "animeCount",
	/** 观看进度，带 {watched} / {total} 占位符 */
	animeProgress = "animeProgress",
	/** 只知道看了几集、不知道总集数时 */
	animeProgressWatched = "animeProgressWatched",
	/** 快照抓取时间，带 {date} 占位符 */
	animeSyncedAt = "animeSyncedAt",
	/** 没有任何追番数据时的空状态 */
	animeEmpty = "animeEmpty",
	/** 空状态的补充说明：怎么把数据同步进来 */
	animeEmptyHint = "animeEmptyHint",
	/** 卡片上「去 B 站看」的链接文字 */
	animeWatchOnBilibili = "animeWatchOnBilibili",
	/** 卡片封面的无障碍名，带 {title} 占位符 */
	animeCoverOf = "animeCoverOf",
	/** 状态：在看 */
	animeStatusWatching = "animeStatusWatching",
	/** 状态：看过 */
	animeStatusCompleted = "animeStatusCompleted",
	/** 状态：想看 */
	animeStatusPlanned = "animeStatusPlanned",
	/** 状态：搁置 */
	animeStatusOnHold = "animeStatusOnHold",
	/** 状态：抛弃 */
	animeStatusDropped = "animeStatusDropped",

	/* ======================================================================
	 * 以下为「最近投币的视频」功能新增的文案键
	 * 对应 src/pages/anime.astro 的投币区块
	 * ==================================================================== */

	/** 追番区块的小标题 */
	animeSection = "animeSection",
	/** 投币区块的小标题 */
	bilibiliCoins = "bilibiliCoins",
	/** 投币区块的说明 */
	bilibiliCoinsDesc = "bilibiliCoinsDesc",
	/** 没有投币记录时的空状态 */
	bilibiliCoinsEmpty = "bilibiliCoinsEmpty",
	/** 空状态的补充说明：怎么同步、以及需要把投币列表设为公开 */
	bilibiliCoinsEmptyHint = "bilibiliCoinsEmptyHint",
	/** 我投了几个币，带 {count} 占位符 */
	bilibiliCoinsGiven = "bilibiliCoinsGiven",
	/** 投币时间，带 {date} 占位符 */
	bilibiliCoinsCoinedAt = "bilibiliCoinsCoinedAt",
	/** UP 主 */
	bilibiliUp = "bilibiliUp",
	/** 播放量 */
	bilibiliView = "bilibiliView",
	/** 弹幕数 */
	bilibiliDanmaku = "bilibiliDanmaku",
	/** 点赞数 */
	bilibiliLike = "bilibiliLike",
	/** 总投币数 */
	bilibiliCoinTotal = "bilibiliCoinTotal",
	/** 封面的无障碍名，带 {title} 占位符 */
	bilibiliCoverOf = "bilibiliCoverOf",

	/* ======================================================================
	 * 以下为「粉丝勋章」页面新增的文案键
	 * 对应 src/pages/medals.astro
	 * ==================================================================== */

	/** 页面标题与导航项 */
	bilibiliMedals = "bilibiliMedals",
	/** 页面说明 */
	bilibiliMedalsDesc = "bilibiliMedalsDesc",
	/** 一枚勋章都没有时的空状态 */
	bilibiliMedalsEmpty = "bilibiliMedalsEmpty",
	/** 空状态的补充说明：需要配 SESSDATA */
	bilibiliMedalsEmptyHint = "bilibiliMedalsEmptyHint",
	/** 勋章总数，带 {count} 占位符 */
	bilibiliMedalsCount = "bilibiliMedalsCount",
	/** 快照抓取时间，带 {date} 占位符 */
	bilibiliMedalsSyncedAt = "bilibiliMedalsSyncedAt",
	/** 佩戴中的小标记 */
	bilibiliMedalWearing = "bilibiliMedalWearing",
	/** 等级，带 {level} 占位符 */
	bilibiliMedalLevel = "bilibiliMedalLevel",
	/** 亲密度，带 {current} / {next} 占位符 */
	bilibiliMedalIntimacy = "bilibiliMedalIntimacy",
	/** 今日亲密度，带 {today} / {limit} 占位符 */
	bilibiliMedalTodayFeed = "bilibiliMedalTodayFeed",
	/** 正在直播 */
	bilibiliMedalLiveNow = "bilibiliMedalLiveNow",
	/** 轮播中 */
	bilibiliMedalLiveRound = "bilibiliMedalLiveRound",
	/** 大航海：总督 / 提督 / 舰长 */
	bilibiliGuardGovernor = "bilibiliGuardGovernor",
	bilibiliGuardAdmiral = "bilibiliGuardAdmiral",
	bilibiliGuardCaptain = "bilibiliGuardCaptain",

	/* ======================================================================
	 * 以下为「数字收藏集」页面新增的文案键
	 * 对应 src/pages/collections.astro
	 *
	 * ⚠️ 注意区分：这里的「收藏集」是 B 站装扮体系里的付费数字卡牌产品，
	 * ==================================================================== */

	/** 页面标题与导航项 */
	bilibiliCollections = "bilibiliCollections",
	/** 页面说明 */
	bilibiliCollectionsDesc = "bilibiliCollectionsDesc",
	/** 一个收藏集都没有时的空状态 */
	bilibiliCollectionsEmpty = "bilibiliCollectionsEmpty",
	/** 空状态的补充说明：怎么跑全量扫描 */
	bilibiliCollectionsEmptyHint = "bilibiliCollectionsEmptyHint",
	/** 收藏集总数，带 {count} 占位符 */
	bilibiliCollectionsCount = "bilibiliCollectionsCount",
	/** 快照抓取时间，带 {date} 占位符 */
	bilibiliCollectionsSyncedAt = "bilibiliCollectionsSyncedAt",
	/** 收集进度，带 {owned} / {total} 占位符 */
	bilibiliCollectionProgress = "bilibiliCollectionProgress",
	/** 已收集的卡牌小标题 */
	bilibiliCollectionOwnedCards = "bilibiliCollectionOwnedCards",
	/** 「在 B 站打开这个收藏集」 */
	bilibiliCollectionOpen = "bilibiliCollectionOpen",
	/** 卡牌封面的无障碍名，带 {name} 占位符 */
	bilibiliCollectionCardOf = "bilibiliCollectionCardOf",
	/** 大隐藏 / 小隐藏 稀有度标记 */
	bilibiliCollectionScarcityHigh = "bilibiliCollectionScarcityHigh",
	bilibiliCollectionScarcityMid = "bilibiliCollectionScarcityMid",
}

export default I18nKey;
