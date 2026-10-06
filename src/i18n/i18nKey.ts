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
}

export default I18nKey;
