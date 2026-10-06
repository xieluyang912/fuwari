/**
 * Umami 统计卡片的浏览器端刷新逻辑。
 *
 * 构建期已经把数字写进 HTML 了（见 utils/umami.ts），这里只是再拉一次
 * 把它换成实时的。拉不到就保留构建期那份 —— 两种失败模式都不会白屏。
 *
 * 实现上和构建期**共用同一份接口代码**（`./umami`），
 * 所以不会出现「一边能出数、一边出不来」的漂移。
 *
 * 只在 `components/system/UmamiRuntime.astro` 里被动态导入，
 * 而那个组件在统计关闭（默认）时渲染出空内容 ——
 * 也就是说没开统计的站点，这个模块连被打包的脚本标签都不会出现。
 */

import { fetchUmamiStats, type UmamiStats } from "./umami";

/** 卡片根节点的选择器，与 UmamiStats.astro 里的约定一一对应 */
const ROOT_SELECTOR = "[data-umami-stats]";

/** 需要填充的指标，键名必须和组件里的 data-umami-metric 一致 */
const METRIC_KEYS: (keyof UmamiStats)[] = ["pageviews", "visitors", "visits"];

/** 把数字写进卡片。成功与失败都要把 dataset 标记掉，避免反复重试 */
function applyStats(stats: UmamiStats): void {
	for (const key of METRIC_KEYS) {
		const value = stats[key];
		document
			.querySelectorAll(`[data-umami-metric="${key}"]`)
			.forEach((node) => {
				node.textContent = value.toLocaleString();
				// 悬停可以看到精确值（卡片里显示的是千分位格式）
				node.setAttribute("title", String(value));
			});
	}
}

/**
 * 找出页面上所有还没填过数的统计卡片，拉一次接口把它们填上。
 *
 * 同一个分享链接只会请求一次：页面里可能有多个卡片
 * （比如首页的侧栏 + 文章页的侧栏），它们共享同一份数据。
 */
export async function refreshUmamiStats(
	root: ParentNode = document,
): Promise<void> {
	const roots = Array.from(
		root.querySelectorAll<HTMLElement>(ROOT_SELECTOR),
	).filter((el) => !el.dataset.umamiLoaded);
	if (roots.length === 0) return;

	// 分享链接写在卡片自己身上，不在脚本里硬编码 ——
	// 这样卡片可以被放到任何位置（左栏 / 右栏 / 文章里）而不用改脚本
	const shareUrl = roots[0].dataset.umamiShareUrl ?? "";
	if (!shareUrl) {
		roots.forEach((el) => {
			el.dataset.umamiLoaded = "failed";
		});
		return;
	}

	roots.forEach((el) => {
		el.dataset.umamiLoaded = "loading";
	});

	const stats = await fetchUmamiStats(shareUrl);

	roots.forEach((el) => {
		el.dataset.umamiLoaded = stats ? "true" : "failed";
	});

	if (!stats) {
		// 静默保留构建期写好的数字。这里刻意不打 console.warn：
		// 访客看到控制台报错只会困惑，而站点本身并没有坏
		return;
	}

	applyStats(stats);
}

let scheduled = false;

/**
 * 把刷新排进下一个动画帧。
 *
 * 用 requestAnimationFrame 而不是直接调用，是为了让首屏渲染优先 ——
 * 统计数字晚一帧出现完全无所谓，卡住首屏才是问题。
 */
export function scheduleUmamiRefresh(root: ParentNode = document): void {
	if (scheduled) return;
	scheduled = true;

	const run = () => {
		scheduled = false;
		void refreshUmamiStats(root);
	};

	if (typeof window.requestAnimationFrame === "function") {
		window.requestAnimationFrame(run);
	} else {
		window.setTimeout(run, 0);
	}
}
