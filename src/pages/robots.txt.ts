import type { APIRoute } from "astro";

// robots.txt 里的路径也要带上 base。本站 base 是 "/"，写死也是同一个结果，
// 但保留这层处理，日后若部署到 /fuwari/ 这类子路径就不会指向不存在的地址
const base = import.meta.env.BASE_URL;

const robotsTxt = `
User-agent: *
Disallow: ${base}_astro/

Sitemap: ${new URL(`${base}sitemap-index.xml`, import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
