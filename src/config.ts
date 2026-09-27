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
	AIToolsConfig,
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	NavBarLink,
	PioConfig,
	ProfileConfig,
	ProjectsConfig,
	SidebarConfig,
	SiteConfig,
	SkillsConfig,
	TimelineConfig,
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
	lang: "en", // 语言代码，例如 'en'、'zh_CN'、'ja' 等
	themeColor: {
		hue: 250, // 主题色的默认色相，取值 0 到 360。例如：红色 0、蓝绿色 200、青色 250、粉色 345
		fixed: false, // 对访客隐藏主题色选择器
	},
	// 首页顶部的大幅横幅图片
	banner: {
		enable: true, // 是否启用横幅图片
		src: "assets/images/girl_backpack_road_1160862_1280x720.jpg", // 相对于 /src 目录。若以 '/' 开头，则相对于 /public 目录
		position: "center", // 等同于 object-position，仅支持 'top'、'center'、'bottom'，默认为 'center'
		// 首页横幅正中间的大标题与副标题（只在首页显示）。
		// 不想要就把 title 和 subtitle 都改成空字符串 ""
		homeText: {
			title: "Xieluyang 的小屋",
			subtitle: "记录一些值得记下来的东西",
		},
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
	// 建站日期，格式 "YYYY-MM-DD"。
	// 右侧栏「站点统计」里的「运行天数」就是从这一天算起的，改成你实际建站的日子即可
	siteStartDate: "2026-09-25",
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
 * 「Others」下拉菜单的内容。
 *
 * 想加东西就往 children 里塞，支持继续嵌套（UI 只渲染一级下拉）。
 * 单独抽成变量是为了让下面 navBarConfig 读起来清爽一点。
 * 注意：变量必须在 navBarConfig 之前声明，否则会踩到 const 的暂时性死区。
 */
const othersMenu: NavBarLink = {
	name: "Others", // 显示成中文可以改成 "其他"
	url: "#", // "#" 只是占位，有 children 的项点击不会跳转
	icon: "material-symbols:more-horiz",
	children: [
		LinkPreset.Projects, // 项目展示页 /projects/
		LinkPreset.Skills, // 技能页 /skills/
		LinkPreset.AITools, // AI 工具导航 /ai-tools/
		LinkPreset.Timeline, // 时间线 /timeline/
		{
			// 想再加自定义项，照这个格式写就行
			name: "Gallery", // 示例：外部相册
			url: "https://github.com/Xieluyang912", // 换成你自己的相册地址
			icon: "material-symbols:photo-library",
			external: true,
		},
	],
};

/**
 * 顶部导航栏的链接列表。
 * 数组中的顺序即为导航栏从左到右的显示顺序。
 *
 * 每一项可以是：
 * - LinkPreset 预设（Home / Archive / About / Projects / Skills / AITools / Timeline）
 * - 自定义对象 { name, url, external?, icon?, children? }
 *
 * 写了 children 的项会自动渲染成「下拉菜单」，
 * 顶栏那个 Others 按钮就是用这个字段做出来的（见上面的 othersMenu）。
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
			icon: "fa6-brands:github", // 图标名使用 Iconify 格式："图标集:图标名"
		},
		{
			// 自定义链接：指向外部的 GitHub 仓库
			name: "bilibili",
			url: "https://space.bilibili.com/3546912602982411", // 内部链接不要包含 base path，它会被自动添加
			external: true, // 显示外链图标，并在新标签页中打开
			icon: "fa6-brands:bilibili",
		},
		// ↓↓↓ 和 Mizuki 一样的「Others」下拉按钮
		othersMenu,
	],
};

/**
 * 侧边栏的个人资料卡片：头像、昵称、简介和社交链接。
 * 由 Profile.astro 组件渲染。links 里的 icon 使用 Iconify 的图标名。
 */
export const profileConfig: ProfileConfig = {
	// 头像图片路径。这里用的是本地图片 src/assets/images/avatar.png，
	// 想换头像直接替换那个文件即可（保持文件名不变，或同步改这里的路径）。
	// 本地路径相对于 /src 目录；以 '/' 开头时相对于 /public 目录；
	// 也可以填 https 开头的网络图片地址（例如 https://github.com/Xieluyang912.png）
	avatar: "assets/images/avatar.png",
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
		{
			// B 站主页，与顶部导航栏用的是同一个 UID
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/3546912602982411",
		},
		{
			// 订阅本站的 RSS。以 "/" 开头表示站内链接，
			// Profile.astro 会自动补上部署用的 base path（本站是 "/"）
			name: "RSS",
			icon: "fa6-solid:rss",
			url: "/rss.xml",
		},
	],
};

/**
 * 左侧栏的「公告」卡片（对齐 Mizuki 参考站）。
 *
 * 访客点右上角的 × 关掉后，会记在浏览器 localStorage 里、之后不再显示。
 * 想让它重新出现：改一下下面的内容并重新构建（内容变了推荐换个 title），
 * 或者让访客清一下浏览器存储。
 * 不需要公告就把 enable 改成 false。
 */
export const announcementConfig: AnnouncementConfig = {
	enable: true,
	title: "公告",
	content: "欢迎来到我的小站～ 这里主要记录一些学习笔记和折腾过程。",
	// 底部的按钮，不需要就整段删掉
	link: {
		text: "了解更多",
		url: "/about/",
		external: false,
	},
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
 * 文章底部的评论区，由 Comments.astro 组件渲染。
 *
 * 用的是 giscus：评论内容存放在 GitHub Discussions 里，页面只嵌一个 iframe，
 * 不需要任何服务器或数据库。访客用 GitHub 账号登录后即可评论。
 *
 * ⚠️ 首次启用需要先在 GitHub 上做准备，否则评论区会显示报错：
 *   1. 仓库必须是公开的（giscus 读不到私有仓库的 Discussions）
 *   2. 仓库 Settings → General → Features 里勾选 Discussions
 *   3. 到 https://github.com/apps/giscus 安装 giscus App，并授权访问该仓库
 *   4. 在仓库的 Discussions 里建一个分类（推荐用 Announcements 类型，
 *      这样只有 giscus 机器人能发起 discussion，访客无法自己开新帖）
 *   5. 打开 https://giscus.app，填入仓库名和分类，页面会直接给出下面
 *      需要的 repoId 和 categoryId，复制过来即可
 *
 * 若暂时不想显示评论区，把 enable 改为 false 就行。
 */
export const commentConfig: CommentConfig = {
	enable: true,
	giscus: {
		repo: "xieluyang912/fuwari",
		repoId: "R_kgDOUrLLdQ", // 由 https://giscus.app 生成，仓库的节点 ID，不是仓库名
		category: "Announcements",
		categoryId: "DIC_kwDOUrLLdc4DGbiA", // 由 https://giscus.app 生成，Announcements 分类的节点 ID

		// 按页面路径匹配 discussion。本站路径形如 /posts/hello-world/，
		// 一篇文章对应一个 discussion。
		// ⚠️ 2026-09 绑定自定义域名 007912.xyz 后，base 从 /fuwari/ 变成了 /，
		// 页面路径整体变短，换域名之前留下的评论会对不上新页面（在 GitHub
		// Discussions 里还在，只是不再显示）。想根治可以改用 "og:title"，
		// 按文章标题匹配，以后再换域名也不会丢。
		mapping: "pathname",
		strict: false, // 是否严格匹配标题，仅在 mapping 为 title / og:title 时有意义
		reactionsEnabled: true, // 在每条评论上显示 emoji 回应
		emitMetadata: false, // 同步 discussion 元数据到 iframe，一般用不到
		inputPosition: "bottom", // 评论输入框在列表的下方
		lang: "zh-CN", // giscus 界面语言。留空则跟随 siteConfig.lang 自动选择
		loading: "lazy", // 滚动到评论区附近才加载，对首屏性能更友好

		// 跟随本站的明暗模式切换。giscus 的主题名可参考 https://giscus.app，
		// 例如去掉边框的 "noborder_light" / "noborder_dark"
		lightTheme: "light",
		darkTheme: "dark",
	},
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

/* ==========================================================================
 * ██  以下为 Mizuki 风格功能配置  ██
 * 看板娘 / 右侧栏 / Others 特色页面
 * ========================================================================== */

/**
 * 左下角看板娘（Live2D 小人）。
 *
 * 想关掉就把 enable 改成 false；想换模型就把 models 换成别的 .model3.json 路径。
 * 模型文件放在 public/pio/models/ 下，路径要以 "/" 开头（相对 public 目录）。
 *
 * ⚠️ 小人的台词、动作由 public/pio/l2d-widget.min.js 提供，
 *    这个文件是第三方控件，升级前建议先备份。
 */
export const pioConfig: PioConfig = {
	enable: true, // 总开关
	models: ["/pio/models/NOIR/noir.model3.json"], // 模型路径，可以填多个实现随机/切换
	position: "left", // 放在左下角（Mizuki 默认也是左下角）
	width: 280, // 模型宽度（像素），想让它大一点就调这个
	height: 250, // 初始高度，加载完会自动按实际内容调整
	mode: "draggable", // 允许用鼠标把小人拖到页面别的地方
	hiddenOnMobile: true, // 手机屏幕上不显示，避免挡住正文
	hideAboutMenu: true, // 隐藏模型自带的 About 按钮（本站不需要）
	dialog: {
		welcome: "欢迎来到我的小站～", // 打开页面时说的第一句话
		touch: [
			// 戳它的时候随机说一句
			"干什么呀～",
			"别戳啦！",
			"再戳我要生气了哦",
			"嘿嘿，痒痒的～",
		],
		home: "点这里回首页哦！",
		skin: ["想看看我的新衣服吗？", "新衣服好看吧～"],
		close: "呜呜，下次再见啦～",
		link: "https://github.com/Xieluyang912", // 「关于」按钮跳转的地址
	},
};

/**
 * 右侧栏配置。
 *
 * 只有当 siteConfig 里没关掉时才会渲染出第三栏（≥1280px 显示，
 * 小屏幕上这些组件会折到正文下方，不会丢功能）。
 */
export const sidebarConfig: SidebarConfig = {
	enable: true, // 关掉就退回原来的「左栏 + 正文」两栏布局
	// 数组顺序 = 从上到下的显示顺序
	widgets: [
		"site-stats", // 站点统计：文章数/分类数/标签数/总字数/运行天数/最近更新
		"calendar", // 日历：有文章的日子会标点，点一下看当天文章
		"categories", // 分类
	],
};

/**
 * 「Others → 项目」页面的内容（对应 /projects/）。
 * items 里加一条就多一张卡片。
 */
export const projectsConfig: ProjectsConfig = {
	description: "这里记录我做过的项目和还在折腾的东西。",
	items: [
		{
			title: "Fuwari 博客",
			description:
				"你正在看的这个站点。基于 Astro + Svelte + Tailwind 构建，移植了 Mizuki 主题的看板娘、日历、右侧栏和一组特色页面，用 Swup 做无刷新跳转，Pagefind 做站内搜索，评论走 giscus。",
			icon: "material-symbols:globe",
			url: "https://007912.xyz/",
			repo: "https://github.com/Xieluyang912/fuwari",
			tags: ["Astro", "Svelte", "Tailwind", "TypeScript"],
			featured: true, // 置顶显示，卡片会高亮
		},
		{
			title: "Gmeek 博客",
			description:
				"另一个博客，用 Gmeek 搭的：拿 GitHub Issues 当内容源，写完 Issue 就自动发布，部署在 GitHub Pages 的根路径上。",
			icon: "material-symbols:article",
			url: "https://xieluyang912.github.io",
			repo: "https://github.com/Xieluyang912/xieluyang912.github.io",
			tags: ["Gmeek", "GitHub Pages", "GitHub Issues"],
		},
		{
			title: "GitHub 个人主页",
			description:
				"和账号同名的仓库，里面的 README 会直接显示在 GitHub 个人主页上。临床医学在读，写代码是爱好。",
			icon: "material-symbols:account-circle",
			url: "https://github.com/Xieluyang912",
			repo: "https://github.com/Xieluyang912/xieluyang912",
			tags: ["Markdown", "Profile"],
		},
		{
			title: "2026 贡献墙",
			description:
				"用 GreenWall 生成的提交记录仓库，把 GitHub 首页的贡献图刷成想要的样子，纯好玩。",
			icon: "material-symbols:grid-on",
			repo: "https://github.com/Xieluyang912/xieluyang912-2026",
			tags: ["GreenWall", "Auto-generated"],
		},
	],
};

/**
 * 「Others → 技能」页面的内容（对应 /skills/）。
 * 每个 category 是一组，组内 items 会渲染成卡片；填了 level 会画进度条。
 */
export const skillsConfig: SkillsConfig = {
	description: "",
	categories: [
		{
			name: "前端",
			icon: "material-symbols:web",
			items: [
				{ name: "HTML / CSS", level: 85, icon: "fa6-brands:html5" },
				{ name: "JavaScript", level: 75, icon: "fa6-brands:js" },
				{ name: "Astro", level: 70, icon: "material-symbols:rocket-launch" },
				{ name: "Svelte", level: 60, icon: "material-symbols:bolt" },
			],
		},
		{
			name: "后端 / 运维",
			icon: "material-symbols:dns",
			items: [
				{ name: "Node.js", level: 65, icon: "fa6-brands:node-js" },
				{ name: "Git", level: 80, icon: "fa6-brands:git-alt" },
				{ name: "Linux", level: 60, description: "能跑起来就算成功" },
			],
		},
		{
			name: "其它",
			icon: "material-symbols:auto-awesome",
			items: [
				{
					name: "写文档",
					level: 70,
					description: "这个博客就是证据",
				},
			],
		},
	],
};

/**
 * 「Others → AI 工具」页面的内容（对应 /ai-tools/）。
 * category 相同的东西会自动归到一组。
 */
export const aiToolsConfig: AIToolsConfig = {
	description: "我平时用得比较顺手的 AI 工具。",
	items: [
		{
			name: "ChatGPT",
			description: "通用对话助手，问问题、写代码、翻译都能用。",
			icon: "material-symbols:chat",
			url: "https://chat.openai.com",
			category: "对话",
			tags: ["OpenAI"],
		},
		{
			name: "Claude",
			description: "长文本理解和代码能力很强，写文档也很好用。",
			icon: "material-symbols:psychology",
			url: "https://claude.ai",
			category: "对话",
			tags: ["Anthropic"],
		},
		{
			name: "GitHub Copilot",
			description: "编辑器里的代码补全，写重复代码时特别省事。",
			icon: "fa6-brands:github",
			url: "https://github.com/features/copilot",
			category: "编程",
			tags: ["代码补全"],
		},
		{
			name: "Stable Diffusion",
			description: "本地部署的绘画模型，可以自己炼丹。",
			icon: "material-symbols:palette",
			url: "https://stability.ai",
			category: "绘图",
			tags: ["开源"],
		},
	],
};

/**
 * 「Others → 时间线」页面的内容（对应 /timeline/）。
 * items 会按 date 从新到旧自动排序，不用自己排。
 * type 可选 education / work / project / award / default，只影响配色。
 */
export const timelineConfig: TimelineConfig = {
	description: "一些值得记下来的时间点。",
	items: [
		{
			date: "2024-01-01",
			title: "这个小站上线了",
			description: "第一次把博客部署到 GitHub Pages。",
			icon: "material-symbols:rocket-launch",
			type: "project",
		},
		{
			date: "2023-09-01",
			title: "开始学习前端",
			description: "从 HTML 和 CSS 开始，慢慢摸到 Astro。",
			icon: "material-symbols:school",
			type: "education",
			tags: ["前端"],
		},
		{
			date: "2023-06-01",
			title: "毕业",
			description: "离开了学校，开始新的阶段。",
			icon: "material-symbols:workspace-premium",
			type: "award",
		},
	],
};
