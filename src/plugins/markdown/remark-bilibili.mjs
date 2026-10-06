import { visit } from "unist-util-visit";
import { getBilibiliEmbedData } from "./core/bilibili.mjs";

/**
 * 在 `remarkDirective` 之后、`parseDirectiveNode` 之前运行。
 *
 * 作用只有一个：把**参数不合法的** `::bilibili{...}` 还原成普通文本。
 *
 * 为什么需要这一步：不还原的话，`parseDirectiveNode` 会把指令节点标成
 * `hName = "bilibili"`，再由 rehypeComponents 交给 BilibiliComponent；
 * 组件确实会返回 null 让这一块消失 —— 但作者是**看不到任何提示**的，
 * 只会发现「我明明写了视频，页面上却什么都没有」，然后反复怀疑人生。
 * 还原成文本后，原始写法会原样显示在页面上，一眼就知道哪里写错了。
 */
function restoreDirectiveText(node) {
	const attributes = Object.entries(node.attributes ?? {})
		.map(([name, value]) => `${name}=${JSON.stringify(String(value))}`)
		.join(" ");

	node.type = "text";
	node.value = `::bilibili${attributes ? `{${attributes}}` : ""}`;
	delete node.name;
	delete node.attributes;
	delete node.children;
	delete node.data;
}

export function remarkBilibili() {
	return (tree) => {
		visit(tree, "leafDirective", (node) => {
			if (node.name === "bilibili" && !getBilibiliEmbedData(node.attributes)) {
				restoreDirectiveText(node);
			}
		});
	};
}
