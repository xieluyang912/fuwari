/**
 * B 站视频门面的客户端激活逻辑。
 *
 * 静态 HTML 里只有一个「门面」：封面区 + 播放按钮 + 标题。
 * 这个模块负责在读者点击（或 `preload="auto"` 且快滚到视口）时，
 * 把真正的 <iframe> 播放器插进去。
 *
 * 分成两层是有意的：
 *   - 没读过带视频的文章的访客，永远不会下载到本模块；
 *   - 读过但没点播放的访客，也永远不会和 B 站发生任何连接。
 *
 * ⚠️ 激活时会**重新校验** data-* 属性。原因是 DOM 是可以被篡改的
 *    （浏览器插件、XSS 注入、控制台手改），而 iframe 的 src 一旦被
 *    改成任意地址就成了开放重定向 / 钓鱼的跳板。校验一次的成本极低。
 */

import { getBilibiliPlayerUrl } from "../plugins/markdown/core/bilibili.mjs";

/** 单个门面：点击 → 创建 iframe */
function activateFacade(facade: HTMLElement): void {
	if (facade.dataset.bilibiliState === "active") return;

	const stage = facade.querySelector<HTMLElement>(".bili-facade__stage");
	const button = facade.querySelector<HTMLButtonElement>(
		"[data-bilibili-activate]",
	);
	const playerUrl = getBilibiliPlayerUrl(
		facade.dataset.bilibiliBvid ?? "",
		facade.dataset.bilibiliPart ?? "",
	);
	if (!stage || !button || !playerUrl) return;

	const player = document.createElement("iframe");
	player.className = "bili-facade__player";
	player.src = playerUrl;
	player.title = facade.dataset.bilibiliTitle ?? "Bilibili";
	player.loading = "lazy";
	// 不给 B 站带完整的来源路径，只带域名
	player.referrerPolicy = "strict-origin-when-cross-origin";
	player.allow = "fullscreen; picture-in-picture";
	player.allowFullscreen = true;

	player.addEventListener(
		"error",
		() => {
			player.remove();
			button.disabled = false;
			facade.dataset.bilibiliState = "error";
		},
		{ once: true },
	);

	button.disabled = true;
	stage.append(player);
	facade.dataset.bilibiliState = "active";
}

/**
 * 给 root 下的所有门面绑定交互。
 *
 * `root` 通常传 Swup 的容器（#swup-container）：无刷新跳转后新文章的门面
 * 是全新的 DOM，需要重新绑一次。
 */
export function initBilibiliFacades(root: ParentNode = document): void {
	const facades = [
		...(root instanceof HTMLElement && root.matches("[data-bilibili]")
			? [root]
			: []),
		...root.querySelectorAll<HTMLElement>("[data-bilibili]"),
	];

	for (const facade of facades) {
		// dataset 标记去重：Swup 的 page:view 可能对同一批 DOM 触达多次
		if (facade.dataset.bilibiliBound === "true") continue;

		const button = facade.querySelector<HTMLButtonElement>(
			"[data-bilibili-activate]",
		);
		if (!button) continue;

		facade.dataset.bilibiliBound = "true";
		button.addEventListener("click", () => activateFacade(facade));

		// preload="auto"：离视口还有 240px 时就提前建好 iframe。
		// 用 IntersectionObserver 而不是一次性全建，是为了不把文章里
		// 靠后的几个视频也一起加载 —— 那等于把「按需加载」又还回去了。
		if (facade.dataset.videoPreload === "auto") {
			if (!("IntersectionObserver" in window)) {
				activateFacade(facade);
				continue;
			}
			const observer = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					observer.disconnect();
					activateFacade(facade);
				},
				{ rootMargin: "240px 0px" },
			);
			observer.observe(facade);
		}
	}
}
