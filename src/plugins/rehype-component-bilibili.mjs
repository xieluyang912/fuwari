/// <reference types="mdast" />
import { h } from "hastscript";
import {
	getBilibiliEmbedData,
	getBilibiliPlayerUrl,
	getBilibiliVideoPageUrl,
} from "./markdown/core/bilibili.mjs";

/**
 * 渲染 B 站视频的「门面」（facade）。
 *
 * 产出的是纯静态 HTML：一张封面占位 + 播放按钮 + 一行标题。
 * **不包含 iframe、不请求 player.bilibili.com、不注入任何第三方脚本**，
 * 所以在读者点击播放之前，这个页面和 B 站之间没有任何数据往来
 * （没有 Cookie、没有 IP 泄漏、没有第三方 JS）。
 *
 * 点击后才由客户端脚本（src/utils/bilibili.ts）创建 iframe ——
 * 那次创建才是唯一的第三方请求，而且是读者自己主动触发的。
 *
 * @param {Record<string, unknown>} properties 指令属性
 * @param {unknown[]} children 子节点。::bilibili 必须写成叶子指令，带子节点说明写法错了
 */
export function BilibiliComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) return null;
	// 走到这里说明 remarkBilibili 已经校验过一遍；再校验一次是防御
	// 「有人绕过 remark 阶段直接调用这个组件」的情况
	const embed = getBilibiliEmbedData(properties);
	if (!embed) return null;

	const { bvid, title, part, preload } = embed;
	const playerUrl = getBilibiliPlayerUrl(bvid, part);
	const pageUrl = getBilibiliVideoPageUrl(bvid, part);
	if (!playerUrl || !pageUrl) return null;

	return h(
		"figure",
		{
			class: "bili-facade not-prose",
			dataBilibili: true,
			dataBilibiliBvid: bvid,
			dataBilibiliPart: String(part),
			dataBilibiliTitle: title,
			// 客户端脚本读这个值决定「点击才加载」还是「快滚到时自动加载」
			dataVideoPreload: preload,
		},
		[
			h("div", { class: "bili-facade__stage" }, [
				h(
					"button",
					{
						class: "bili-facade__play",
						type: "button",
						dataBilibiliActivate: true,
						// 无障碍名用标题，读屏用户才知道这个按钮是干嘛的
						ariaLabel: title,
					},
					[
						h("span", {
							class: "bili-facade__play-icon",
							"aria-hidden": "true",
						}),
					],
				),
			]),
			h("figcaption", { class: "bili-facade__caption" }, [
				h("strong", { class: "bili-facade__title" }, title),
				h(
					"a",
					{
						class: "bili-facade__source",
						href: pageUrl,
						target: "_blank",
						rel: "noopener noreferrer",
					},
					"Bilibili",
				),
			]),
		],
	);
}
