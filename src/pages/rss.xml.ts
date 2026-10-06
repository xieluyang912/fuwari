import rss from "@astrojs/rss";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getSortedPosts } from "@utils/content-utils";
import { isLockedPost } from "@utils/password-protection";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();

	// @astrojs/rss 会拿这个 site 当作频道自身的地址，所以要把 base 一起带上。
	// 本站 base 是 "/"，等价于直接用域名根；日后若改回子路径，这里不用动
	const site = new URL(
		import.meta.env.BASE_URL,
		context.site ?? "https://fuwari.vercel.app",
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site,
		items: blog.map((post) => {
			/*
			 * 加密文章在 RSS 里必须整段换掉。
			 * 这里原本是把 post.body（Markdown 原文）渲染成 HTML 塞进 feed ——
			 * 对加密文章来说那就是把明文直接发到订阅器里，锁等于白上了。
			 * 所以只留一句「去站点上看」，标题前面加个锁做区分。
			 */
			const locked = isLockedPost(post.data);
			if (locked) {
				return {
					title: `🔒 ${post.data.title}`,
					pubDate: post.data.published,
					description: i18n(I18nKey.postEncryptedSummary),
					link: url(`/posts/${post.slug}/`),
					content: `<p><em>🔒 ${i18n(I18nKey.postEncryptedSummary)}</em></p>`,
				};
			}

			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.slug}/`),
				content: sanitizeHtml(parser.render(cleanedContent), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		}),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
