/**
 * B 站数据的读取入口：投币视频、勋章、数字收藏集。
 *
 * 和追番一样，只做一件事：把该显示什么算出来。
 * 页面只调用 `getCoinVideos()` / `getFanMedals()` / `getCollections()`，
 * 不关心数据来自快照还是兜底。
 *
 * ⚠️ 这里**永远不发网络请求**。想让数据变新，去跑
 *    `pnpm anime:sync --provider bilibili`。
 */

import { resolvedAnimeOptions } from "../config/animeConfig";
import type {
	BilibiliCollection,
	BilibiliFanMedal,
	BilibiliVideo,
} from "../data/bilibili";
import {
	coinVideosData,
	collectionsData,
	fanMedalsData,
} from "../data/bilibili";
import {
	parseCoinSnapshot,
	parseCollectionSnapshot,
	parseMedalSnapshot,
} from "./bilibili/normalize";
import { readJsonSnapshot } from "./snapshot";

export type CoinVideosResult = {
	items: BilibiliVideo[];
	source: "snapshot" | "fallback" | "disabled";
	/** 快照抓取时间 */
	fetchedAt?: string;
	/** 数据是否已过期 */
	stale?: boolean;
};

/**
 * 取投币视频列表。
 *
 * 投币列表没有「本地手写」这一档：它天然就是一份抓取结果，
 * 手抄几个 BV 号没有意义（封面和计数都拿不到）。
 * 所以降级只会得到空列表 + 一个「怎么同步」的提示。
 */
export function getCoinVideos(): CoinVideosResult {
	const options = resolvedAnimeOptions;

	if (!options.coins.enable) {
		return { items: [], source: "disabled" };
	}

	const snapshot = readJsonSnapshot<BilibiliVideo>({
		directory: options.snapshot.directory,
		file: options.coins.file,
		staleAfterDays: options.snapshot.staleAfterDays,
		parse: parseCoinSnapshot,
		label: "bilibili-coins",
	});

	if (snapshot) {
		return {
			// maxItems 是「页面上最多展示多少条」，在读取侧截断，
			// 这样快照可以留全量数据，改配置就能多显示几条而不用重新同步
			items: snapshot.items.slice(0, options.coins.maxItems),
			source: "snapshot",
			fetchedAt: snapshot.fetchedAt,
			stale: snapshot.stale,
		};
	}

	return { items: coinVideosData, source: "fallback" };
}

/** 供页面直接用的便捷导出 */
export type { BilibiliVideo };

/* ==========================================================================
 * 粉丝勋章
 * ========================================================================== */

export type FanMedalsResult = {
	medals: BilibiliFanMedal[];
	source: "snapshot" | "fallback" | "disabled";
	fetchedAt?: string;
	stale?: boolean;
};

/**
 * 取粉丝勋章列表。
 *
 * ⚠️ 这块只能靠带凭据的同步：勋章墙接口不接受匿名访问。
 *    拿不到快照时页面显示的是「怎么配置 SESSDATA」的提示。
 */
export function getFanMedals(): FanMedalsResult {
	const options = resolvedAnimeOptions;

	if (!options.medals.enable) {
		return { medals: [], source: "disabled" };
	}

	const snapshot = readJsonSnapshot<BilibiliFanMedal>({
		directory: options.snapshot.directory,
		file: options.medals.file,
		staleAfterDays: options.snapshot.staleAfterDays,
		parse: parseMedalSnapshot,
		label: "bilibili-medals",
	});

	if (snapshot) {
		return {
			// maxItems 在读取侧截断，快照里留全量，改配置重新构建即可
			medals: snapshot.items.slice(0, options.medals.maxItems),
			source: "snapshot",
			fetchedAt: snapshot.fetchedAt,
			stale: snapshot.stale,
		};
	}

	return { medals: fanMedalsData, source: "fallback" };
}

export type { BilibiliFanMedal };

/* ==========================================================================
 * 数字收藏集（装扮体系里的，不是收藏夹）
 * ========================================================================== */

export type CollectionsResult = {
	collections: BilibiliCollection[];
	source: "snapshot" | "fallback" | "disabled";
	fetchedAt?: string;
	stale?: boolean;
};

/**
 * 取数字收藏集列表。
 *
 * ⚠️ 需要 SESSDATA；没配或还没跑过全量扫描时，页面显示的是「怎么同步」的提示。
 */
export function getCollections(): CollectionsResult {
	const options = resolvedAnimeOptions;

	if (!options.collections.enable) {
		return { collections: [], source: "disabled" };
	}

	const snapshot = readJsonSnapshot<BilibiliCollection>({
		directory: options.snapshot.directory,
		file: options.collections.file,
		staleAfterDays: options.snapshot.staleAfterDays,
		parse: parseCollectionSnapshot,
		label: "bilibili-collections",
	});

	if (snapshot) {
		return {
			// maxItems 在读取侧截断，快照里留全量
			collections: snapshot.items.slice(0, options.collections.maxItems),
			source: "snapshot",
			fetchedAt: snapshot.fetchedAt,
			stale: snapshot.stale,
		};
	}

	return { collections: collectionsData, source: "fallback" };
}

export type { BilibiliCollection };
