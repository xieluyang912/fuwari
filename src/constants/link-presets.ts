import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { LinkPreset, type NavBarLink } from "@/types/config";

/**
 * 导航栏预设链接表。
 *
 * 在 navBarConfig 里直接写 LinkPreset.Home 这样的枚举值，
 * 渲染时会从这里取出对应的 { name, url, icon }。
 * 好处是名字会跟着 siteConfig.lang 自动切换语言。
 */
export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
		icon: "material-symbols:home-outline-rounded",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
		icon: "material-symbols:person-outline-rounded",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
		icon: "material-symbols:archive-outline-rounded",
	},

	/* ---- 下面 4 个是「Others」下拉里用到的特色页面，对应 src/pages 下的同名文件 ---- */
	[LinkPreset.Projects]: {
		name: i18n(I18nKey.projects),
		url: "/projects/",
		icon: "material-symbols:work-outline",
	},
	[LinkPreset.Skills]: {
		name: i18n(I18nKey.skills),
		url: "/skills/",
		icon: "material-symbols:psychology-outline",
	},
	[LinkPreset.AITools]: {
		name: i18n(I18nKey.aiTools),
		url: "/ai-tools/",
		icon: "material-symbols:smart-toy-outline",
	},
	[LinkPreset.Timeline]: {
		name: i18n(I18nKey.timeline),
		url: "/timeline/",
		icon: "material-symbols:timeline",
	},

	/* ---- 标签总览页，对应 src/pages/tags.astro ---- */
	[LinkPreset.Tags]: {
		name: i18n(I18nKey.tags),
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},

	/* ---- 追番页，对应 src/pages/anime.astro ---- */
	[LinkPreset.Anime]: {
		name: i18n(I18nKey.anime),
		url: "/anime/",
		icon: "fa6-brands:bilibili",
	},

	/* ---- 粉丝勋章页，对应 src/pages/medals.astro ---- */
	[LinkPreset.Medals]: {
		name: i18n(I18nKey.bilibiliMedals),
		url: "/medals/",
		icon: "material-symbols:military-tech-outline",
	},

	/* ---- 数字收藏集页，对应 src/pages/collections.astro ----
	 * 注意是装扮体系的「收藏集」（付费数字卡牌），不是「收藏夹」 */
	[LinkPreset.Collections]: {
		name: i18n(I18nKey.bilibiliCollections),
		url: "/collections/",
		icon: "material-symbols:style-outline",
	},
};
