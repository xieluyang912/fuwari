/**
 * 番剧页的数据读取入口。
 *
 * 只做一件事：按 `animeConfig` 的配置把「该显示哪些番剧」算出来。
 * 页面（`src/pages/anime.astro`）只调用 `getAnimeList()`，不关心数据从哪来。
 *
 * 读取顺序：
 *   1. `source.kind === "local"` → 直接用 `src/data/anime.ts` 的手写数据；
 *   2. `source.kind === "snapshot"` → 读 `<snapshot.directory>/<source.file>`：
 *        - 文件在 → 解析 + 归一化（解析失败按缺失处理）
 *        - 文件不在 / 解析失败 → 走降级策略
 *   3. 降级：`fallback.kind === "local"` 回退手写数据；`"empty"` 返回空数组。
 *
 * 定位文件、读盘、判过期、打警告这一套在 utils/snapshot.ts 里，
 * 投币视频（utils/bilibili-data.ts）共用同一份实现。
 *
 * ⚠️ 这里**永远不发网络请求**。想让快照变新，去跑 `pnpm anime:sync`。
 *    把抓取放进构建看起来很省事，实际会让构建依赖外网和 B 站的可用性，
 *    也会让「今天部署的产物」和「昨天部署的产物」不可复现。
 */

import { animeConfig, resolvedAnimeOptions } from "../config/animeConfig";
import type { AnimeItem } from "../data/anime";
import { animeData } from "../data/anime";
import { parseAnimeSnapshot } from "./anime/normalize";
import { readJsonSnapshot } from "./snapshot";

/** 说明本次数据的来源，方便在构建日志里定位问题 */
export type AnimeListResult = {
	items: AnimeItem[];
	source: "local" | "snapshot" | "fallback" | "disabled";
	/** 快照抓取时间（本地数据没有这个字段） */
	fetchedAt?: string;
	/** 数据是否已过期 */
	stale?: boolean;
};

/**
 * 取番剧列表。
 *
 * @returns 归一化并排好序的条目，以及数据来源说明
 */
export function getAnimeList(): AnimeListResult {
	const options = resolvedAnimeOptions;

	if (!options.enable) {
		return { items: [], source: "disabled" };
	}

	if (options.source.kind === "local") {
		return { items: animeData, source: "local" };
	}

	const file = options.source.file;
	if (!file) {
		// resolveAnimeOptions 理论上不会给出这种组合，兜一下底
		return { items: animeData, source: "local" };
	}

	const snapshot = readJsonSnapshot<AnimeItem>({
		directory: options.snapshot.directory,
		file,
		staleAfterDays: options.snapshot.staleAfterDays,
		parse: parseAnimeSnapshot,
		label: "anime",
	});

	if (snapshot) {
		return {
			items: snapshot.items,
			source: "snapshot",
			fetchedAt: snapshot.fetchedAt,
			stale: snapshot.stale,
		};
	}

	if (options.fallback === "empty") {
		return { items: [], source: "fallback" };
	}
	return { items: animeData, source: "fallback" };
}

/** 页面标题：配置留空时交给调用方用多语言文案兜底 */
export const animeTitle = animeConfig.title;
/** 页面说明：同上 */
export const animeDescription = animeConfig.description;
