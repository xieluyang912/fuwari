import Key from "../i18nKey";
import type { Translation } from "../translation";

export const en: Translation = {
	[Key.home]: "Home",
	[Key.about]: "About",
	[Key.archive]: "Archive",
	[Key.search]: "Search",

	[Key.tags]: "Tags",
	[Key.categories]: "Categories",
	[Key.recentPosts]: "Recent Posts",
	[Key.toc]: "Table of Contents",

	[Key.comments]: "Comments",

	[Key.untitled]: "Untitled",
	[Key.uncategorized]: "Uncategorized",
	[Key.noTags]: "No Tags",

	[Key.wordCount]: "word",
	[Key.wordsCount]: "words",
	[Key.minuteCount]: "minute",
	[Key.minutesCount]: "minutes",
	[Key.postCount]: "post",
	[Key.postsCount]: "posts",

	[Key.themeColor]: "Theme Color",

	[Key.lightMode]: "Light",
	[Key.darkMode]: "Dark",
	[Key.systemMode]: "System",

	[Key.more]: "More",

	[Key.author]: "Author",
	[Key.publishedAt]: "Published at",
	[Key.license]: "License",

	/* ---- 导航栏下拉菜单 ---- */
	[Key.navLinks]: "Links",
	[Key.navMy]: "My",
	[Key.navAbout]: "About",
	[Key.navOthers]: "Others",

	/* ---- 站点统计 ---- */
	[Key.siteStats]: "Site Statistics",
	[Key.siteStatsPostCount]: "Posts",
	[Key.siteStatsCategoryCount]: "Categories",
	[Key.siteStatsTagCount]: "Tags",
	[Key.siteStatsTotalWords]: "Total Words",
	[Key.siteStatsRunningDays]: "Running Days",
	[Key.siteStatsDays]: "{days} days",
	[Key.siteStatsLastUpdate]: "Last Update",
	[Key.siteStatsDaysAgo]: "{days} days ago",

	/* ---- 日历 ---- */
	[Key.calendar]: "Calendar",
	[Key.calendarJan]: "Jan",
	[Key.calendarFeb]: "Feb",
	[Key.calendarMar]: "Mar",
	[Key.calendarApr]: "Apr",
	[Key.calendarMay]: "May",
	[Key.calendarJun]: "Jun",
	[Key.calendarJul]: "Jul",
	[Key.calendarAug]: "Aug",
	[Key.calendarSep]: "Sep",
	[Key.calendarOct]: "Oct",
	[Key.calendarNov]: "Nov",
	[Key.calendarDec]: "Dec",
	[Key.calendarMon]: "Mon",
	[Key.calendarTue]: "Tue",
	[Key.calendarWed]: "Wed",
	[Key.calendarThu]: "Thu",
	[Key.calendarFri]: "Fri",
	[Key.calendarSat]: "Sat",
	[Key.calendarSun]: "Sun",
	[Key.calendarNoPost]: "No posts this month",
	[Key.calendarBackToToday]: "Back to today",
	[Key.calendarSelectMonthYear]: "Select month or year",
	[Key.calendarPrevMonth]: "Previous month",
	[Key.calendarNextMonth]: "Next month",

	/* ---- Others 特色页面 ---- */
	[Key.projects]: "Projects",
	[Key.projectsDesc]: "Things I have built and am still tinkering with.",
	[Key.skills]: "Skills",
	[Key.skillsDesc]: "What I can do, and what I am still learning.",
	[Key.aiTools]: "AI Tools",
	[Key.aiToolsDesc]: "AI tools I actually use.",
	[Key.timeline]: "Timeline",
	[Key.timelineDesc]: "A few moments worth writing down.",
	[Key.viewProject]: "View project",
	[Key.viewSource]: "Source code",
	[Key.noContent]: "Nothing here yet",

	/* ---- 文章加密 ---- */
	[Key.postPasswordTitle]: "Password Protected",
	[Key.postPasswordDescription]:
		"This post is encrypted. Enter the password to unlock its content.",
	[Key.postPasswordLabel]: "Password",
	[Key.postPasswordPlaceholder]: "Enter password",
	[Key.postPasswordShow]: "Show password",
	[Key.postPasswordHide]: "Hide password",
	[Key.postPasswordRequired]: "Please enter a password",
	[Key.postPasswordInvalid]: "Incorrect password",
	[Key.postPasswordUnlock]: "Unlock",
	[Key.postPasswordUnlocking]: "Decrypting…",
	[Key.postPasswordUnsupported]:
		"This browser cannot decrypt the post. Please use a modern browser and open the site over HTTPS.",
	[Key.postEncryptedSummary]: "This post is password-protected.",
	[Key.postEncryptedBadge]: "Protected",
	[Key.postEncryptedLabel]: "Password-protected post",

	/* ---- 标签总览页 ---- */
	[Key.viewAllTags]: "View all tags",
	[Key.tagsMoreCount]: "{count} more",
	[Key.tagsPageStats]: "{tags} tags · {posts} posts",
	[Key.tagsPageDescription]:
		"Every tag used on this site. Click one to see the posts filed under it.",
	[Key.tagsGroupOther]: "Other",
	[Key.tagsEmpty]: "No tags yet",
	[Key.tagsViewTagPosts]: "View all posts tagged {tag}",

	/* ---- Umami 访问统计 ---- */
	[Key.umamiStats]: "Traffic",
	[Key.umamiPageviews]: "Pageviews",
	[Key.umamiVisitors]: "Visitors",
	[Key.umamiVisits]: "Visits",

	/* ---- 追番（Bilibili 同步） ---- */
	[Key.anime]: "Anime",
	[Key.animeDesc]: "The anime I follow on Bilibili.",
	[Key.animeCount]: "{count} titles",
	[Key.animeProgress]: "{watched} / {total} episodes",
	[Key.animeProgressWatched]: "{watched} episodes watched",
	[Key.animeSyncedAt]: "Synced {date}",
	[Key.animeEmpty]: "No anime data yet",
	[Key.animeEmptyHint]:
		"Run `pnpm anime:sync --provider bilibili` to fetch your Bilibili follow list, then rebuild.",
	[Key.animeWatchOnBilibili]: "Watch on Bilibili",
	[Key.animeCoverOf]: "Cover of {title}",
	[Key.animeStatusWatching]: "Watching",
	[Key.animeStatusCompleted]: "Completed",
	[Key.animeStatusPlanned]: "Planned",
	[Key.animeStatusOnHold]: "On Hold",
	[Key.animeStatusDropped]: "Dropped",

	/* ---- 最近投币的视频 ---- */
	[Key.animeSection]: "Following",
	[Key.bilibiliCoins]: "Recently Coined",
	[Key.bilibiliCoinsDesc]: "Videos I recently gave coins to on Bilibili.",
	[Key.bilibiliCoinsEmpty]: "No coined videos yet",
	[Key.bilibiliCoinsEmptyHint]:
		"Run `pnpm anime:sync --provider bilibili` to fetch them. Your coined-video list must be public in Bilibili's privacy settings.",
	[Key.bilibiliCoinsGiven]: "{count} coins given",
	[Key.bilibiliCoinsCoinedAt]: "Coined {date}",
	[Key.bilibiliUp]: "Uploader",
	[Key.bilibiliView]: "Views",
	[Key.bilibiliDanmaku]: "Danmaku",
	[Key.bilibiliLike]: "Likes",
	[Key.bilibiliCoinTotal]: "Coins",
	[Key.bilibiliCoverOf]: "Cover of {title}",

	/* ---- 粉丝勋章 ---- */
	[Key.bilibiliMedals]: "Fan Medals",
	[Key.bilibiliMedalsDesc]:
		"My Bilibili fan medals (live streaming medal wall).",
	[Key.bilibiliMedalsEmpty]: "No fan medals yet",
	[Key.bilibiliMedalsEmptyHint]:
		"The medal wall API requires login. Add BILI_SESSDATA to your .env, then run `pnpm anime:sync --provider bilibili`.",
	[Key.bilibiliMedalsCount]: "{count} medals",
	[Key.bilibiliMedalsSyncedAt]: "Synced {date}",
	[Key.bilibiliMedalWearing]: "Wearing",
	[Key.bilibiliMedalLevel]: "Lv{level}",
	[Key.bilibiliMedalIntimacy]: "{current} / {next} intimacy",
	[Key.bilibiliMedalTodayFeed]: "{today} / {limit} today",
	[Key.bilibiliMedalLiveNow]: "Live now",
	[Key.bilibiliMedalLiveRound]: "Rerun",
	[Key.bilibiliGuardGovernor]: "Governor",
	[Key.bilibiliGuardAdmiral]: "Admiral",
	[Key.bilibiliGuardCaptain]: "Captain",

	/* ---- digital collections (garb product, NOT favourites) ---- */
	[Key.bilibiliCollections]: "Digital Collections",
	[Key.bilibiliCollectionsDesc]:
		"Cards I collected from Bilibili digital collections.",
	[Key.bilibiliCollectionsEmpty]: "No collections synced yet",
	[Key.bilibiliCollectionsEmptyHint]:
		"Add BILI_SESSDATA to your .env, then run `pnpm anime:sync --provider bilibili --scan-collections`. The full scan walks 1500+ collections and may trip Bilibili's rate limiting, so run it occasionally; normal syncs only refresh what is already known.",
	[Key.bilibiliCollectionsCount]: "{count} collections",
	[Key.bilibiliCollectionsSyncedAt]: "Synced {date}",
	[Key.bilibiliCollectionProgress]: "Collected {owned} / {total}",
	[Key.bilibiliCollectionOwnedCards]: "Cards I own",
	[Key.bilibiliCollectionOpen]: "Open on Bilibili",
	[Key.bilibiliCollectionCardOf]: "Card art of {name}",
	[Key.bilibiliCollectionScarcityHigh]: "Big hidden",
	[Key.bilibiliCollectionScarcityMid]: "Small hidden",
};
