/**
 * GitHub 仓库卡片的「构建时取数」模块。
 *
 * 背景：卡片原来是浏览器端 fetch api.github.com 实时取数的，有三个坑叠在一起：
 *   1. 匿名调用限流 60 次/小时/IP，而 About 页一次就要发 6 个请求
 *      —— 每小时只够刷十次页面，之后全部取不到数据
 *   2. 取数代码没检查 response.ok，403 的错误体会被当成正常仓库数据
 *      往下渲染，卡片上出现 NaN / undefined / "Description not set"
 *   3. 请求失败时没有任何提示，卡片永远停在 "Waiting for api.github.com..."
 *
 * 现在改成构建时抓一次，结果存进 src/data/github-cards.json，
 * 页面上渲染成纯静态 HTML —— 访客的浏览器一次请求都不发，
 * 也就跟限流、跟访问者的网络环境彻底无关了。
 *
 * 几个设计取舍：
 *   - 缓存文件提交进仓库，所以 CI 构建通常不需要联网，也就不会被限流
 *   - 只有超过 MAX_AGE_DAYS 天的条目才会重抓；抓失败就沿用旧数据并打警告，
 *     绝不让网络问题把整次构建搞崩
 *   - 立即可用的刷新开关：GITHUB_CARDS_REFRESH=1 重新构建
 *   - 提高额度：构建时带上 GITHUB_TOKEN 环境变量（6000 次/小时）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** 缓存文件位置：src/data/github-cards.json（提交进仓库） */
const CACHE_PATH = fileURLToPath(
	new URL("../data/github-cards.json", import.meta.url),
);
/** 扫描范围：所有 markdown 内容，卡片指令只可能出现在这里 */
const CONTENT_DIR = fileURLToPath(new URL("../content", import.meta.url));

/** 缓存多少天后算过期。想改就改这里，或者用环境变量覆盖 */
const DEFAULT_MAX_AGE_DAYS = 7;
const MAX_AGE_DAYS = Number(
	process.env.GITHUB_CARDS_MAX_AGE_DAYS || DEFAULT_MAX_AGE_DAYS,
);

const API_BASE = "https://api.github.com/repos/";

/**
 * 内存里的一份数据副本。
 *
 * 集成（astro.config.mjs 里那个）在 astro:config:setup 阶段把它填好，
 * 之后 rehype 组件在渲染时同步读取 —— 组件本身是同步函数，不能发请求。
 */
const repoData = new Map();

/**
 * 从 src/content 下所有 md/mdx 里找出用到的仓库。
 *
 * 注意这里扫的是「源文件」而不是渲染结果：取数发生在渲染之前，
 * 没法等组件自己来登记。漏扫的仓库不会报错，只是卡片会退化成纯链接。
 */
export function collectRepos() {
	const repos = new Set();
	const walk = (dir) => {
		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(full);
			} else if (/\.mdx?$/.test(entry.name)) {
				const text = fs.readFileSync(full, "utf8");
				for (const [, repo] of text.matchAll(
					/::github\{[^}]*?repo="([^"]+)"/g,
				)) {
					repos.add(repo.trim());
				}
			}
		}
	};
	walk(CONTENT_DIR);
	return [...repos].sort();
}

/** 同步读一条仓库数据，供 rehype 组件调用。没有就返回 undefined */
export function getRepoData(repo) {
	return repoData.get(repo);
}

function readCache() {
	try {
		const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
		return { repos: parsed?.repos ?? {} };
	} catch {
		// 文件不存在或坏了都当空缓存处理，不影响构建
		return { repos: {} };
	}
}

function writeCache(cache) {
	fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
	fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function isStale(entry, forceRefresh) {
	if (forceRefresh) return true;
	if (!entry?.fetchedAt) return true;
	const age = Date.now() - new Date(entry.fetchedAt).getTime();
	return !(age >= 0) || age > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/** 只保留渲染用得上的字段，别把整个 API 响应塞进缓存 */
function pickFields(json) {
	return {
		// 描述里的 emoji 短代码（:smile: 这种）在卡片上显示不出来，去掉
		description: (json.description ?? "").replace(/:[a-zA-Z0-9_]+:/g, "").trim(),
		language: json.language ?? "",
		stars: json.stargazers_count ?? 0,
		forks: json.forks_count ?? 0,
		license: json.license?.spdx_id ?? "",
		avatar: json.owner?.avatar_url ?? "",
		fetchedAt: new Date().toISOString(),
	};
}

async function fetchRepo(repo, token) {
	const headers = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "fuwari-build-github-card",
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(`${API_BASE}${repo}`, { headers });
	if (!res.ok) {
		const hint =
			res.status === 403
				? "（多半是匿名限流，带上 GITHUB_TOKEN 或等额度重置）"
				: "";
		throw new Error(`HTTP ${res.status} ${res.statusText}${hint}`);
	}
	return pickFields(await res.json());
}

/**
 * 构建时入口：把需要的仓库数据准备好，放进内存并回写缓存。
 *
 * 永远不抛异常 —— 取数失败只降级（沿用旧数据 / 卡片退化成纯链接）：
 * 一次网络抖动不该让整站构建失败。
 */
export async function loadRepoData({ logger } = {}) {
	const log = {
		info: (msg) => logger?.info?.(msg),
		warn: (msg) => logger?.warn?.(msg),
	};

	const repos = collectRepos();
	if (repos.length === 0) {
		log.info("没有发现 ::github 卡片，跳过取数。");
		return;
	}

	const cache = readCache();
	const force = Boolean(process.env.GITHUB_CARDS_REFRESH);
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
	const stale = repos.filter((repo) => isStale(cache.repos[repo], force));

	if (stale.length === 0) {
		log.info(
			`${repos.length} 个仓库卡片全部命中本地缓存（${MAX_AGE_DAYS} 天内），不发请求。`,
		);
	} else {
		log.info(
			`需要更新 ${stale.length}/${repos.length} 个仓库卡片${token ? "（已带 token）" : "（匿名请求，限流 60 次/小时）"}…`,
		);
		// 几个请求而已，直接并发
		const results = await Promise.all(
			stale.map(async (repo) => {
				try {
					return [repo, await fetchRepo(repo, token), null];
				} catch (err) {
					return [repo, null, err];
				}
			}),
		);
		for (const [repo, data, err] of results) {
			if (data) {
				cache.repos[repo] = data;
			} else {
				const kept = cache.repos[repo] ? "，沿用缓存里的旧数据" : "";
				log.warn(`取不到 ${repo}：${err.message}${kept}`);
			}
		}
		if (results.some(([, data]) => data)) writeCache(cache);
	}

	// 交给渲染阶段。取不到数据的仓库不放进 map，组件会退化成纯链接卡片
	for (const repo of repos) {
		if (cache.repos[repo]) repoData.set(repo, cache.repos[repo]);
	}
	const missing = repos.filter((repo) => !repoData.has(repo));
	if (missing.length > 0) {
		log.warn(
			`${missing.length} 个仓库没有可用数据，卡片会退化成纯链接：${missing.join("、")}`,
		);
	}
}
