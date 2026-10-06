/**
 * `::bilibili{...}` 指令的解析核心（与 Markdown 管线无关的纯函数）。
 *
 * 单独抽出来是为了能被 remark 插件、rehype 组件、客户端脚本三处共用：
 * 三处对「什么算合法参数」的判断必须完全一致，否则会出现
 * 「渲染出来了但点不动」这类只在某一层校验失败的怪问题。
 *
 * ── 支持的参数 ────────────────────────────────────────────────────────
 *   bvid    必填，形如 BV1GJ411x7h7
 *   p       可选，分 P 序号，默认 1。Shirone 用的是 p
 *   part    可选，p 的别名。本站两个都收，写哪个都行
 *   title   可选，卡片标题。不写就用 BV 号当标题
 *   preload 可选，"none"（默认，点击才加载）| "auto"（快滚到时自动加载）
 *
 * ⚠️ 只接受 BV 号。`av170001` 这类老式 av 号不做兼容 ——
 *    把 av 转 BV 需要额外的算法，而真正需要兼容的场景极少；
 *    写错了会被明确地降级成纯文本（见 remark-bilibili.mjs），而不是静默出一个破播放器。
 */

/** BV 号格式。B 站的 BV 编码里不会出现 0 / I / O / l，这个字符集是它的全集 */
export const BILIBILI_BVID_PATTERN = /^BV[1-9A-HJ-NP-Za-km-z]{10}$/;

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

const VIDEO_PRELOAD_VALUES = new Set(["none", "auto"]);

function getText(value) {
	return typeof value === "string" ? value.trim() : "";
}

/** 分 P 序号：非法值返回 null（区别于「没填」的 undefined） */
function getPart(value) {
	const part = getText(value);
	if (!part) return 1;
	if (!POSITIVE_INTEGER_PATTERN.test(part)) return null;

	const parsed = Number.parseInt(part, 10);
	return Number.isSafeInteger(parsed) ? parsed : null;
}

function getPreload(value) {
	const preload = getText(value).toLowerCase();
	if (!preload) return "none";
	return VIDEO_PRELOAD_VALUES.has(preload) ? preload : null;
}

/**
 * 把指令参数解析成一份可渲染的数据。
 * @param {Record<string, unknown>} attributes 指令上的属性
 * @returns {{bvid: string, title: string, part: number, preload: string} | null}
 */
export function getBilibiliEmbedData(attributes = {}) {
	const bvid = getText(attributes.bvid);
	// `p` 优先，`part` 作为别名兜底
	const part = getPart(attributes.p ?? attributes.part);
	const preload = getPreload(attributes.preload);

	if (!BILIBILI_BVID_PATTERN.test(bvid) || part === null || preload === null) {
		return null;
	}

	// title 可以不写：用 BV 号兜底，保证卡片上永远有一行可读的文字
	const title = getText(attributes.title) || bvid;

	return { bvid, title, part, preload };
}

/**
 * 生成播放器 URL。这是**唯一**被允许嵌入的第三方地址。
 *
 * 用 URLSearchParams 而不是字符串拼接：bvid 已经过正则校验，
 * 但仍然不给自己留拼接出错的机会（历史上 bvid 里出现 `&` 会直接
 * 把后面拼的参数变成攻击者可控的查询串）。
 *
 * @returns 非法输入返回 null
 */
export function getBilibiliPlayerUrl(bvid, part) {
	if (!BILIBILI_BVID_PATTERN.test(getText(bvid))) return null;
	if (!POSITIVE_INTEGER_PATTERN.test(String(part))) return null;

	const parsedPart = Number.parseInt(String(part), 10);
	if (!Number.isSafeInteger(parsedPart)) return null;

	const url = new URL("https://player.bilibili.com/player.html");
	url.searchParams.set("bvid", getText(bvid));
	url.searchParams.set("p", String(parsedPart));
	url.searchParams.set("high_quality", "1");
	url.searchParams.set("danmaku", "0");
	return url.toString();
}

/** 生成番剧/视频在 B 站上的原页面地址，供「去 B 站看」链接使用 */
export function getBilibiliVideoPageUrl(bvid, part) {
	if (!BILIBILI_BVID_PATTERN.test(getText(bvid))) return null;
	const parsedPart = POSITIVE_INTEGER_PATTERN.test(String(part))
		? Number.parseInt(String(part), 10)
		: 1;

	const url = new URL(`https://www.bilibili.com/video/${getText(bvid)}/`);
	url.searchParams.set("p", String(parsedPart));
	return url.toString();
}
