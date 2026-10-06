/*
 * 新建文章的脚手架。
 *
 * 采用「一篇文章一个文件夹」的方案（详见 docs/post-folders.md）：
 *
 *   pnpm new-post hello-world
 *     → src/content/posts/hello-world/index.md
 *
 * 之所以不生成平铺的 hello-world.md：文件夹方案下配图能和正文放在一起，
 * 用 `./cover.jpg`、`./photo.png` 这样的相对路径引用，图片跟着文章一起
 * 进 Git、一起改名、一起删除。事后把一个平铺的 .md 改成文件夹要手工搬图片、
 * 改路径，很烦；一开始就生成对的结构，后面就不用还这笔债。
 *
 * 传子路径也可以，文件夹会一并创建：
 *   pnpm new-post 2026/hello-world
 */

import fs from "node:fs";
import path from "node:path";

function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error(`Error: No filename argument provided
Usage: npm run new-post -- <filename>`);
	process.exit(1); // Terminate the script and return error code 1
}

// 去掉用户可能顺手写上的 .md / .mdx：现在生成的是文件夹，扩展名由脚本决定
const slug = args[0].replace(/\.(md|mdx)$/i, "").replace(/^\/+|\/+$/g, "");

if (!slug) {
	console.error("Error: filename cannot be empty");
	process.exit(1);
}

const targetDir = "./src/content/posts";
const postDir = path.join(targetDir, slug);
const fullPath = path.join(postDir, "index.md");

if (fs.existsSync(postDir)) {
	console.error(`Error: Directory ${postDir} already exists `);
	process.exit(1);
}

// recursive 让 2026/hello-world 这种多级路径也能一次建好
fs.mkdirSync(postDir, { recursive: true });

// image 先留空：等真正放了 cover 图，再改成 './cover.jpg'。
// 空字符串不会触发图片解析，构建时也不会报「找不到图片」
const content = `---
title: ${slug}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
`;

fs.writeFileSync(fullPath, content);

console.log(`Post created: ${fullPath}`);
console.log(
	`封面/插图直接放进 ${postDir}/，正文里用 ./<文件名> 引用，例如 ./cover.jpg`,
);
