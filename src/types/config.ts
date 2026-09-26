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
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
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
		 * - pathname：按路径匹配（默认）。本站路径形如 /fuwari/posts/hello/，简洁直观，
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
