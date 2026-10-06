import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/*
		 * 文章加密（见 src/components/misc/EncryptedContent.astro）
		 *
		 * 只要填了非空的 password，这篇文章就会被加密：正文在构建时被加密，
		 * 页面里只有密文，访客必须输对密码才能看到。
		 *
		 * password 本身是明文的构建输入，别把它提交进公开仓库 ——
		 * 用环境变量或本地不提交的 frontmatter 来管更稳妥。
		 *
		 * 同时收 string 和 number：YAML 里写 `password: 123456`（不带引号）
		 * 会被解析成数字，只收 string 的话这种写法会莫名其妙地报校验错。
		 * 统一由 isLockedPost() 转成字符串处理。
		 */
		password: z.union([z.string(), z.number()]).optional(),
		/** 密码提示，会明文显示在密码框下方。不想给提示就别填 */
		passwordHint: z.string().optional().default(""),
		/**
		 * 保险开关：写了 true 却没填 password，构建会直接报错，避免误发明文。
		 * 具体校验在 utils/content-utils.ts 的 getRawSortedPosts 里 ——
		 * 那里能拿到文章 slug，报错能指到具体是哪篇。
		 */
		encrypted: z.boolean().optional().default(false),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
