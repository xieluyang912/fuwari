/// <reference types="mdast" />
import { h } from "hastscript";
import { getRepoData } from "./github-card-data.mjs";

/**
 * 数字格式化，和原来浏览器端那段 JS 保持一致：1234 -> "1.2K"。
 *
 * 要去掉的那个字符是 U+202F（窄不换行空格），en-us 的紧凑记法会带上它。
 * 这里用 fromCharCode 显式写出来，不直接把字面量放进源码 ——
 * 它在编辑器里跟普通空格长得一模一样，放进去以后没人看得出这行在删什么。
 */
const compactFormatter = new Intl.NumberFormat("en-us", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const NARROW_NO_BREAK_SPACE = String.fromCharCode(0x202f);
const compact = (n) =>
	compactFormatter.format(n ?? 0).replaceAll(NARROW_NO_BREAK_SPACE, "");

/**
 * 渲染一张 GitHub 仓库卡片。
 *
 * 数据是构建时抓好存在本地的（见 github-card-data.mjs），这里只做静态渲染。
 *
 * 和旧版的区别：不再往页面里塞 <script>、不再有 fetch、不再有 "Waiting..." 占位。
 * 代价是数据只在构建时更新一次，不是实时的 —— 想刷新见 github-card-data.mjs 顶部说明。
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created GitHub Card component.
 */
export function GithubCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
		]);

	if (!properties.repo || !properties.repo.includes("/"))
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
		);

	const repo = properties.repo;
	const [owner, name] = repo.split("/");
	const data = getRepoData(repo);

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				h("div", {
					class: "gc-avatar",
					// 头像直接写成背景图（样式里 .gc-avatar 就是 background-size: cover），
					// 省掉原来那段「拿到数据后再设置 backgroundImage」的 JS
					style: data?.avatar
						? `background-image: url('${data.avatar}'); background-color: transparent`
						: undefined,
				}),
				h("div", { class: "gc-user" }, owner),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, name),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		"div",
		{ class: "gc-description" },
		data
			? data.description || "Description not set"
			: "暂时取不到仓库信息（构建时没抓到数据）",
	);

	const content = [nTitle, nDescription];

	// 没有数据时整条信息栏都不渲染，而不是留一堆 0 和 NaN
	if (data) {
		content.push(
			h("div", { class: "gc-infobar" }, [
				h("div", { class: "gc-stars" }, compact(data.stars)),
				h("div", { class: "gc-forks" }, compact(data.forks)),
				h("div", { class: "gc-license" }, data.license || "no-license"),
				h("div", { class: "gc-language" }, data.language || ""),
			]),
		);
	}

	return h(
		"a",
		{
			// 没有 fetch-waiting / fetch-error 了：卡片要么有数据，要么明说取不到
			class: "card-github no-styling",
			href: `https://github.com/${repo}`,
			target: "_blank",
			repo,
		},
		content,
	);
}
