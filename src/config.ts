/**
 * 站点配置文件 —— 整个博客的"总开关"
 *
 * 这是使用本主题时你唯一需要修改的文件。下面每个 export 出来的常量
 * 对应站点的一块功能，改完保存、重新构建即可生效。
 *
 * 几点说明：
 * 1. 每个常量的字段类型定义在 ./types/config.ts 中，编辑器会据此给出
 *    类型提示和报错。例如 lang 只能填 "en"、"zh_CN"、"ja" 等枚举值。
 * 2. 这里的所有配置都在「构建时」被读取并写进生成的静态页面，
 *    所以修改后需要重新运行 pnpm build / pnpm dev 才能看到效果。
 * 3. 涉及颜色的配置（themeColor）会通过 ConfigCarrier.astro
 *    传给浏览器，供客户端脚本在运行时读取。
 */

import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/**
 * 站点全局信息：标题、副标题、语言、主题色、横幅图和网站图标。
 * 被 Layout.astro（页面标题）、Navbar.astro（导航栏文字）、
 * rss.xml.ts（RSS 订阅源信息）等引用。
 */
export const siteConfig: SiteConfig = {
	// 站点标题，显示在浏览器标签页、导航栏和 RSS 中
	title: "Xieluyang",
	subtitle: "Demo Site",
	lang: "zh_CN", // 语言代码，例如 'en'、'zh_CN'、'ja' 等
	themeColor: {
		hue: 250, // 主题色的默认色相，取值 0 到 360。例如：红色 0、蓝绿色 200、青色 250、粉色 345
		fixed: false, // 对访客隐藏主题色选择器
	},
	// 首页顶部的大幅横幅图片
	banner: {
		enable: false, // 是否启用横幅图片
		src: "assets/images/demo-banner.png", // 相对于 /src 目录。若以 '/' 开头，则相对于 /public 目录
		position: "center", // 等同于 object-position，仅支持 'top'、'center'、'bottom'，默认为 'center'
		// 图片版权信息：鼠标悬停在横幅右下角时显示，用于标注图片来源
		credit: {
			enable: false, // 显示横幅图片的版权信息
			text: "", // 要显示的版权文字
			url: "", // （可选）原作品或作者主页的链接
		},
	},
	// 文章页右侧的目录（Table of Contents）
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 2, // 目录中显示的最大标题层级，取值为 1 到 3
	},
	// 网站图标（浏览器标签页上的小图标），支持为浅色/深色模式分别指定
	favicon: [
		// 将此数组留空以使用默认的网站图标
		// {
		//   src: '/favicon/icon.png',    // 网站图标的路径，相对于 /public 目录
		//   theme: 'light',              // （可选）'light' 或 'dark'，仅当浅色和深色模式使用不同图标时才需要设置
		//   sizes: '32x32',              // （可选）网站图标的尺寸，仅当有不同尺寸的图标时才需要设置
		// }
	],
};

/**
 * 顶部导航栏的链接列表。
 * 数组中的顺序即为导航栏从左到右的显示顺序。
 * 可以直接使用 LinkPreset 里内置的三个页面（对应 /、/archive/、/about/），
 * 也可以自己写一个对象来添加任意链接。
 */
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home, // 首页
		LinkPreset.Archive, // 归档页，按时间列出所有文章
		LinkPreset.About, // 关于页
		{
			// 自定义链接：指向外部的 GitHub 仓库
			name: "GitHub",
			url: "https://github.com/Xieluyang912", // 内部链接不要包含 base path，它会被自动添加
			external: true, // 显示外链图标，并在新标签页中打开
		},
	],
};

/**
 * 侧边栏的个人资料卡片：头像、昵称、简介和社交链接。
 * 由 Profile.astro 组件渲染。links 里的 icon 使用 Iconify 的图标名。
 */
export const profileConfig: ProfileConfig = {
	// 可以直接填 https 开头的网络图片地址（这里用 GitHub 头像，改头像时无需改配置）；
	// 若换成本地图片，则相对于 /src 目录，以 '/' 开头时相对于 /public 目录
	avatar: "https://github.com/Xieluyang912.png",
	name: "Xieluyang",
	bio: "Xieluyang love you.",
	links: [
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://my.steamchina.com/profiles/76561199180022050/",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Xieluyang912",
		},
	],
};

/**
 * 文章底部的版权声明，由 License.astro 组件渲染。
 * name 是协议名称（仅用于显示），url 指向协议的完整说明页面。
 * 若不想显示版权信息，把 enable 改为 false 即可。
 */
export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

/**
 * 代码块的语法高亮主题。
 * 注意：这份配置是在 astro.config.mjs 里被引用的，在构建时决定代码高亮的配色，
 * 而不是在运行时生效。
 */
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：部分样式（如背景色）会被覆盖，详见 astro.config.mjs 文件
	// 请选择深色主题，因为本博客主题目前仅支持深色背景
	theme: "github-dark",
};
