import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		/**
		 * 首页横幅正中间的大标题 / 副标题（对齐 Mizuki 首页的效果）。
		 * 留空则不显示文字，只保留横幅图片。
		 */
		homeText?: {
			title: string;
			subtitle: string;
		};
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	/**
	 * 建站日期，格式 "YYYY-MM-DD"。
	 * 供「站点统计」小部件计算「已经运行了多少天」使用。
	 */
	siteStartDate?: string;

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	// ---- 以下为「Others」里用到的特色页面预设 ----
	Projects = 3,
	Skills = 4,
	AITools = 5,
	Timeline = 6,
	// ---- 标签总览页 /tags/ ----
	Tags = 7,
	// ---- 追番页 /anime/（数据由 pnpm anime:sync 同步） ----
	Anime = 8,
	// ---- 粉丝勋章页 /medals/（同一套同步命令） ----
	Medals = 10,
	// ---- 数字收藏集页 /collections/（装扮体系的收藏集，不是收藏夹） ----
	Collections = 11,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
	/** Iconify 图标名，形如 "material-symbols:home"。留空则不显示图标 */
	icon?: string;
	/**
	 * 子菜单。写了 children 的导航项会渲染成「下拉菜单」而不是普通链接，
	 * 数组里同样可以混用 LinkPreset 枚举和自定义链接对象。
	 * 顶栏的 Others 按钮就是靠这个字段实现的。
	 */
	children?: (NavBarLink | LinkPreset)[];
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

/**
 * 左侧栏的「公告」卡片（对齐 Mizuki）。
 * 访客点右上角的 × 关掉后会记在 localStorage 里，之后不再显示。
 */
export type AnnouncementConfig = {
	enable: boolean;
	/** 卡片标题 */
	title: string;
	/** 正文，纯文本 */
	content: string;
	/** （可选）底部的按钮 */
	link?: {
		text: string;
		url: string;
		/** 外部链接会在新标签页打开 */
		external?: boolean;
	};
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type CommentConfig = {
	enable: boolean;

	/**
	 * giscus 的配置参数，除了语言之外都要与 https://giscus.app 上生成的一致，
	 * 否则评论区会显示「giscus is not installed on this repository」之类的报错。
	 */
	giscus: {
		/** 存放评论的 GitHub 仓库，格式为 "owner/repo" */
		repo: string;
		/** 仓库 ID，由 giscus.app 生成，不是仓库名 */
		repoId: string;
		/** Discussion 分类名，例如 "Announcements" */
		category: string;
		/** 分类 ID，由 giscus.app 生成 */
		categoryId: string;
		/**
		 * 一个页面如何对应一个 discussion：
		 * - pathname：按路径匹配（默认）。本站路径形如 /posts/hello/，简洁直观，
		 *   但日后若改动 base 或域名，已有评论会「对不上号」
		 * - og:title：按文章标题匹配。换域名不影响，但标题重复或改名会串评论
		 */
		mapping: "pathname" | "url" | "title" | "og:title" | "specific" | "number";
		/** 是否严格匹配标题，仅在 mapping 为 title / og:title 时有意义 */
		strict: boolean;
		/** 是否在每条评论上显示 emoji 回应 */
		reactionsEnabled: boolean;
		/** 是否把 discussion 的元数据同步到 iframe，供页面自行读取，一般用不到 */
		emitMetadata: boolean;
		/** 评论输入框的位置 */
		inputPosition: "top" | "bottom";
		/** giscus 界面的语言，如 "zh-CN"。留空则自动跟随 siteConfig.lang */
		lang?: string;
		/** lazy 表示滚动到评论区附近才加载 iframe，对首屏性能更友好 */
		loading: "lazy" | "eager";
		/** 浅色模式下的 giscus 主题，可选值见 https://giscus.app 的外观设置 */
		lightTheme: string;
		/** 深色模式下的 giscus 主题 */
		darkTheme: string;
	};
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

/* ============================================================================
 * 以下为从 Mizuki 主题移植过来的功能配置类型
 * 对应功能：看板娘(Pio)、右侧栏、Others 特色页面
 * ========================================================================== */

/**
 * 左下角看板娘（Live2D 小人）配置。
 *
 * 实现方式：页面里放一个透明的 <iframe>，iframe 内部加载
 * public/pio/live2d-host.html，由它去创建真正的 Live2D 模型。
 * 用 iframe 隔开的好处是模型自带的脚本/样式不会污染主页面。
 */
export type PioConfig = {
	/** 总开关，false 则整块不渲染 */
	enable: boolean;
	/** 模型文件路径数组，相对 public 目录。可以放多个模型随机切换 */
	models: string[];
	/** 显示在左下角还是右下角 */
	position?: "left" | "right";
	/** 模型显示宽度（像素） */
	width?: number;
	/** 模型显示高度（像素），仅作为初始高度，加载完会按实际内容自适应 */
	height?: number;
	/** draggable：可以用鼠标把小人拖到页面任意位置 */
	mode?: "draggable" | "fixed";
	/** 移动端（宽度 ≤ 768px）是否隐藏，防止挡住内容 */
	hiddenOnMobile?: boolean;
	/** 是否隐藏模型自带的「About」按钮 */
	hideAboutMenu?: boolean;
	/** 台词。留空则使用内置的默认台词 */
	dialog?: {
		/** 欢迎语，页面加载完先说这句 */
		welcome?: string;
		/** 戳一戳（点击模型）时随机说的几句 */
		touch?: string[];
		/** 点击「主页」按钮时的提示 */
		home?: string;
		/** 换装时的提示（两句话：刚点的时候 / 换完之后） */
		skin?: string[];
		/** 关闭看板娘时的告别语 */
		close?: string;
		/** 「About」按钮跳转的链接 */
		link?: string;
	};
};

/**
 * 右侧栏里各个小组件的开关与顺序。
 * 数组顺序 = 从上到下的显示顺序。
 */
export type SidebarWidgetType =
	| "site-stats"
	| "calendar"
	| "categories"
	| "umami";

export type SidebarConfig = {
	/** 右侧栏是否启用。关掉后退回原来的两栏布局 */
	enable: boolean;
	/** 右侧栏要显示哪些小部件，以及它们的顺序 */
	widgets: SidebarWidgetType[];
};

/* ---------------------- 标签系统（侧栏只放一部分 + /tags/ 总览页） ---------------------- */

/**
 * 标签系统配置。
 *
 * 背景：文章一多，标签就会多到几十个。全部塞进左侧栏那张小卡片里，
 * 左栏会被撑得比正文还长，首页首屏基本全被标签占满。
 *
 * 所以拆成两处显示：
 *   - 左侧栏：只放最「重」的若干个（见 sidebarLimit），下面给一个「全部标签」入口
 *   - /tags/ 页面：完整列表，带文章数、字号按热度缩放，可选按首字母分组
 */
export type TagsConfig = {
	/**
	 * 左侧栏「标签」卡片最多显示几个标签。
	 * 设为 0 表示不限制，全部显示（标签很少时可以这么用）。
	 */
	sidebarLimit: number;
	/**
	 * 左侧栏标签的排序方式：
	 * - count：按文章数从多到少（默认，保证先看到最有代表性的标签）
	 * - name：按名称字母序（与 /tags/ 页面、归档页的观感一致）
	 */
	sidebarSort: "count" | "name";
	/** /tags/ 页面标签的排序方式，取值含义同上 */
	pageSort: "count" | "name";
	/** /tags/ 页面是否按首字母分组（数字 / A-Z / 其它） */
	pageGroupByLetter: boolean;
	/** /tags/ 页面是否在每个标签后面显示文章数（左侧栏的标签卡片同样遵循这一项） */
	showCount: boolean;
	/** /tags/ 页面标签云的字号是否随文章数缩放（越热门的标签越大） */
	cloudSizing: boolean;
	/** /tags/ 页面顶部的一句话说明。留空则使用内置的多语言文案 */
	description: string;
};

/* ---------------------- Others 里的 4 个特色页面 ---------------------- */

/** 项目卡片 */
export type ProjectItem = {
	/** 项目名 */
	title: string;
	/** 一句话简介 */
	description: string;
	/** 图标，Iconify 名称；也可以用 "img:/xxx.png" 指定图片 */
	icon?: string;
	/** 封面图，可选 */
	image?: string;
	/** 项目主页链接 */
	url?: string;
	/** 源码仓库链接 */
	repo?: string;
	/** 标签，例如 ["Astro", "TypeScript"] */
	tags?: string[];
	/** 是否置顶（置顶的排在前面并高亮） */
	featured?: boolean;
};

export type ProjectsConfig = {
	/** 页面顶部说明文字 */
	description?: string;
	items: ProjectItem[];
};

/** 技能条目 */
export type SkillItem = {
	/** 技能名 */
	name: string;
	/** 描述 */
	description?: string;
	/** 图标，Iconify 名称 */
	icon?: string;
	/** 熟练度 0 ~ 100，填了就会画一条进度条 */
	level?: number;
};

/** 技能分组 */
export type SkillCategory = {
	/** 分组名，例如「前端」「后端」「工具」 */
	name: string;
	/** 分组图标 */
	icon?: string;
	items: SkillItem[];
};

export type SkillsConfig = {
	description?: string;
	categories: SkillCategory[];
};

/** AI 工具条目 */
export type AIToolItem = {
	/** 工具名 */
	name: string;
	/** 简介 */
	description: string;
	/** 图标 */
	icon?: string;
	/** 工具地址 */
	url: string;
	/** 分类，用于分组显示，例如「对话」「绘图」「编程」 */
	category?: string;
	/** 标签 */
	tags?: string[];
};

export type AIToolsConfig = {
	description?: string;
	items: AIToolItem[];
};

/** 时间线节点 */
export type TimelineItem = {
	/** 日期，格式 "YYYY-MM-DD" */
	date: string;
	/** 标题 */
	title: string;
	/** 描述 */
	description?: string;
	/** 图标 */
	icon?: string;
	/** 节点类型：决定了圆点/卡片配色 */
	type?: "education" | "work" | "project" | "award" | "default";
	/** 相关链接 */
	url?: string;
	/** 标签 */
	tags?: string[];
};

export type TimelineConfig = {
	description?: string;
	items: TimelineItem[];
};
