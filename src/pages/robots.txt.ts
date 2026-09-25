import type { APIRoute } from "astro";

// 部署在子路径下时，robots.txt 里的路径也必须带上 base（形如 /fuwari/），
// 否则 /_astro/ 匹配不到实际目录，Sitemap 也会指向不存在的地址
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
