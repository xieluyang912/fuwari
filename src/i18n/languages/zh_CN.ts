import Key from "../i18nKey";
import type { PartialTranslation } from "../translation";

export const zh_CN: PartialTranslation = {
	[Key.home]: "主页",
	[Key.about]: "关于",
	[Key.archive]: "归档",
	[Key.search]: "搜索",

	[Key.tags]: "标签",
	[Key.categories]: "分类",
	[Key.recentPosts]: "最新文章",
	[Key.toc]: "目录",

	[Key.comments]: "评论",

	[Key.untitled]: "无标题",
	[Key.uncategorized]: "未分类",
	[Key.noTags]: "无标签",

	[Key.wordCount]: "字",
	[Key.wordsCount]: "字",
	[Key.minuteCount]: "分钟",
	[Key.minutesCount]: "分钟",
	[Key.postCount]: "篇文章",
	[Key.postsCount]: "篇文章",

	[Key.themeColor]: "主题色",

	[Key.lightMode]: "亮色",
	[Key.darkMode]: "暗色",
	[Key.systemMode]: "跟随系统",

	[Key.more]: "更多",

	[Key.author]: "作者",
	[Key.publishedAt]: "发布于",
	[Key.license]: "许可协议",

	/* ---- 导航栏下拉菜单 ---- */
	[Key.navLinks]: "链接",
	[Key.navMy]: "我的",
	[Key.navAbout]: "关于",
	[Key.navOthers]: "其他",

	/* ---- 站点统计 ---- */
	[Key.siteStats]: "站点统计",
	[Key.siteStatsPostCount]: "文章数",
	[Key.siteStatsCategoryCount]: "分类数",
	[Key.siteStatsTagCount]: "标签数",
	[Key.siteStatsTotalWords]: "总字数",
	[Key.siteStatsRunningDays]: "运行天数",
	[Key.siteStatsDays]: "{days} 天",
	[Key.siteStatsLastUpdate]: "最近更新",
	[Key.siteStatsDaysAgo]: "{days} 天前",

	/* ---- 日历 ---- */
	[Key.calendar]: "日历",
	[Key.calendarJan]: "1月",
	[Key.calendarFeb]: "2月",
	[Key.calendarMar]: "3月",
	[Key.calendarApr]: "4月",
	[Key.calendarMay]: "5月",
	[Key.calendarJun]: "6月",
	[Key.calendarJul]: "7月",
	[Key.calendarAug]: "8月",
	[Key.calendarSep]: "9月",
	[Key.calendarOct]: "10月",
	[Key.calendarNov]: "11月",
	[Key.calendarDec]: "12月",
	[Key.calendarMon]: "一",
	[Key.calendarTue]: "二",
	[Key.calendarWed]: "三",
	[Key.calendarThu]: "四",
	[Key.calendarFri]: "五",
	[Key.calendarSat]: "六",
	[Key.calendarSun]: "日",
	[Key.calendarNoPost]: "这个月还没有文章",
	[Key.calendarBackToToday]: "回到今天",
	[Key.calendarSelectMonthYear]: "选择月份或年份",
	[Key.calendarPrevMonth]: "上个月",
	[Key.calendarNextMonth]: "下个月",

	/* ---- Others 特色页面 ---- */
	[Key.projects]: "项目",
	[Key.projectsDesc]: "这里记录我做过的项目和还在折腾的东西。",
	[Key.skills]: "技能",
	[Key.skillsDesc]: "",
	[Key.aiTools]: "AI 工具",
	[Key.aiToolsDesc]: "我平时用得比较顺手的 AI 工具。",
	[Key.timeline]: "时间线",
	[Key.timelineDesc]: "一些值得记下来的时间点。",
	[Key.viewProject]: "查看项目",
	[Key.viewSource]: "源码",
	[Key.noContent]: "这里还什么都没有",

	/* ---- 文章加密 ---- */
	[Key.postPasswordTitle]: "这是一篇加密文章",
	[Key.postPasswordDescription]: "文章内容已加密，输入密码后才能查看。",
	[Key.postPasswordLabel]: "密码",
	[Key.postPasswordPlaceholder]: "请输入密码",
	[Key.postPasswordShow]: "显示密码",
	[Key.postPasswordHide]: "隐藏密码",
	[Key.postPasswordRequired]: "请输入密码",
	[Key.postPasswordInvalid]: "密码错误",
	[Key.postPasswordUnlock]: "解锁",
	[Key.postPasswordUnlocking]: "解密中…",
	[Key.postPasswordUnsupported]:
		"当前浏览器无法解密该文章。请换用现代浏览器，并通过 HTTPS 访问本站。",
	[Key.postEncryptedSummary]: "本文已加密，输入密码后可查看。",
	[Key.postEncryptedBadge]: "已加密",
	[Key.postEncryptedLabel]: "加密文章",

	/* ---- 标签总览页 ---- */
	[Key.viewAllTags]: "查看全部标签",
	[Key.tagsMoreCount]: "还有 {count} 个",
	[Key.tagsPageStats]: "{tags} 个标签 · {posts} 篇文章",
	[Key.tagsPageDescription]:
		"这里汇总了全站用到的所有标签，点任意一个即可查看对应文章。",
	[Key.tagsGroupOther]: "其它",
	[Key.tagsEmpty]: "还没有任何标签",
	[Key.tagsViewTagPosts]: "查看带有 {tag} 标签的全部文章",

	/* ---- Umami 访问统计 ---- */
	[Key.umamiStats]: "访问统计",
	[Key.umamiPageviews]: "浏览量",
	[Key.umamiVisitors]: "访客数",
	[Key.umamiVisits]: "访问次数",

	/* ---- 追番（Bilibili 同步） ---- */
	[Key.anime]: "追番",
	[Key.animeDesc]: "我在 B 站追的番。",
	[Key.animeCount]: "共 {count} 部",
	[Key.animeProgress]: "{watched} / {total} 集",
	[Key.animeProgressWatched]: "看过 {watched} 集",
	[Key.animeSyncedAt]: "数据更新于 {date}",
	[Key.animeEmpty]: "还没有追番数据",
	[Key.animeEmptyHint]:
		"先在本地执行 `pnpm anime:sync --provider bilibili` 抓取 B 站追番列表，然后重新构建。",
	[Key.animeWatchOnBilibili]: "去 B 站看",
	[Key.animeCoverOf]: "{title} 的封面",
	[Key.animeStatusWatching]: "在看",
	[Key.animeStatusCompleted]: "看过",
	[Key.animeStatusPlanned]: "想看",
	[Key.animeStatusOnHold]: "搁置",
	[Key.animeStatusDropped]: "抛弃",

	/* ---- 最近投币的视频 ---- */
	[Key.animeSection]: "追番",
	[Key.bilibiliCoins]: "最近投币",
	[Key.bilibiliCoinsDesc]: "我最近在 B 站投过币的视频。",
	[Key.bilibiliCoinsEmpty]: "还没有投币记录",
	[Key.bilibiliCoinsEmptyHint]:
		"先在本地执行 `pnpm anime:sync --provider bilibili` 抓取。注意需要在 B 站的隐私设置里把「投币视频」设为公开，否则接口会返回 53013。",
	[Key.bilibiliCoinsGiven]: "投了 {count} 个币",
	[Key.bilibiliCoinsCoinedAt]: "{date} 投币",
	[Key.bilibiliUp]: "UP 主",
	[Key.bilibiliView]: "播放",
	[Key.bilibiliDanmaku]: "弹幕",
	[Key.bilibiliLike]: "点赞",
	[Key.bilibiliCoinTotal]: "投币",
	[Key.bilibiliCoverOf]: "{title} 的封面",

	/* ---- 粉丝勋章 ---- */
	[Key.bilibiliMedals]: "粉丝勋章",
	[Key.bilibiliMedalsDesc]: "我在 B 站拿到的粉丝勋章（直播间勋章墙）。",
	[Key.bilibiliMedalsEmpty]: "还没有拿到任何勋章",
	[Key.bilibiliMedalsEmptyHint]:
		"勋章墙接口需要登录才能访问。请在项目根目录的 .env 里配置 BILI_SESSDATA，再执行 `pnpm anime:sync --provider bilibili`。",
	[Key.bilibiliMedalsCount]: "{count} 枚勋章",
	[Key.bilibiliMedalsSyncedAt]: "数据更新于 {date}",
	[Key.bilibiliMedalWearing]: "佩戴中",
	[Key.bilibiliMedalLevel]: "{level} 级",
	[Key.bilibiliMedalIntimacy]: "亲密度 {current} / {next}",
	[Key.bilibiliMedalTodayFeed]: "今日 {today} / {limit}",
	[Key.bilibiliMedalLiveNow]: "直播中",
	[Key.bilibiliMedalLiveRound]: "轮播中",
	[Key.bilibiliGuardGovernor]: "总督",
	[Key.bilibiliGuardAdmiral]: "提督",
	[Key.bilibiliGuardCaptain]: "舰长",

	/* ---- 数字收藏集（装扮体系里的，不是收藏夹） ---- */
	[Key.bilibiliCollections]: "数字收藏集",
	[Key.bilibiliCollectionsDesc]: "我在 B 站收藏集里收集到的卡牌。",
	[Key.bilibiliCollectionsEmpty]: "还没有同步到任何收藏集",
	[Key.bilibiliCollectionsEmptyHint]:
		"首次需要在项目根目录的 .env 里配置 BILI_SESSDATA，然后执行 `pnpm anime:sync --provider bilibili --scan-collections`。注意全量扫描要遍历 1500+ 个收藏集、请求量较大且可能触发 B 站风控，偶尔跑一次即可；之后普通同步只会刷新已知的那些。",
	[Key.bilibiliCollectionsCount]: "{count} 个收藏集",
	[Key.bilibiliCollectionsSyncedAt]: "数据更新于 {date}",
	[Key.bilibiliCollectionProgress]: "已收集 {owned} / {total}",
	[Key.bilibiliCollectionOwnedCards]: "我拥有的卡牌",
	[Key.bilibiliCollectionOpen]: "在 B 站打开",
	[Key.bilibiliCollectionCardOf]: "{name} 的卡面",
	[Key.bilibiliCollectionScarcityHigh]: "大隐藏",
	[Key.bilibiliCollectionScarcityMid]: "小隐藏",
};
