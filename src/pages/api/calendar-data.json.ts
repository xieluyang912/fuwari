/**
 * 日历小部件的数据接口：/api/calendar-data.json
 *
 * 构建时会生成一个静态的 JSON 文件，内容是「所有文章的 slug + 标题 + 发布日期 + 链接」。
 * 为什么不在页面里直接把数据写进 HTML：
 * 日历要支持切换任意年月，如果数据内联在页面里，
 * 每个页面（包括每篇文章页）的 HTML 都会白白多带一份全站文章列表。
 *
 * 注意：链接是在这里拼好的，已经带上 base path，
 * 前端 Svelte 组件直接拿 href 用就行，不用再关心部署在哪个子路径。
 */
import type { APIRoute } from "astro";
import { getSortedPosts } from "../../utils/content-utils";
import { formatDateToYYYYMMDD } from "../../utils/date-utils";
import { getPostUrlBySlug } from "../../utils/url-utils";

export const GET: APIRoute = async () => {
	const posts = await getSortedPosts();

	const allPostsData = posts.map((post) => ({
		id: post.slug,
		title: post.data.title,
		date: formatDateToYYYYMMDD(post.data.published),
		url: getPostUrlBySlug(post.slug),
	}));

	return new Response(JSON.stringify(allPostsData), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			// 内容只在重新构建时变化，让浏览器/CDN 缓存一天，减少无效请求
			"Cache-Control": "public, max-age=86400",
		},
	});
};
