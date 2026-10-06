import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { isLockedPost } from "@utils/password-protection";
import { getCategoryUrl } from "@utils/url-utils.ts";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	/*
	 * 构建时就把「标了 encrypted: true 却没填 password」的文章拦下来。
	 *
	 * 放在这里是因为所有会渲染文章的路径（列表、归档、文章页、RSS）都要
	 * 经过这个函数 —— 是唯一的必经之路。而这种情况属于最危险的静默失败：
	 * 作者以为加了密，实际会以明文发布。宁可构建失败，也不能那样发出去。
	 * 报错带上 slug，方便直接定位是哪篇。
	 */
	for (const post of allBlogPosts) {
		isLockedPost(post.data, post.slug);
	}

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	/**
	 * 这里比完整的 frontmatter 少了 password —— 原因见 getSortedPostsList。
	 */
	data: Omit<CollectionEntry<"posts">["data"], "password">;
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => {
		const data = { ...post.data };

		/*
		 * 把 password 摘掉再往外给。
		 *
		 * 这个函数的返回值会喂给 archive.astro 里 client:only="svelte" 的
		 * ArchivePanel —— Astro 会把 props 序列化成 JSON 塞进 HTML。
		 * 也就是说 data 里有什么，访客在页面源码里就能看到什么。
		 * 密码跟着发出去的话，加密文章就白加密了。
		 *
		 * 这里统一摘掉，比在每个组件里各自小心要可靠：
		 * 只要以后有人再往 frontmatter 里加敏感字段，也只需改这一处。
		 */
		delete data.password;

		return { slug: post.slug, data };
	});

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
