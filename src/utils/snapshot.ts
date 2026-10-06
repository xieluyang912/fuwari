/**
 * 构建期读取 JSON 快照的公共逻辑。
 *
 * 追番（anime-data.ts）和投币视频（bilibili-data.ts）的读取流程一模一样：
 * 定位文件 → 读盘 → 解析 → 判断是否过期 → 出错就降级。
 * 与其抄两遍，不如把这段抽出来，两边各自只提供「怎么解析」和「降级用什么」。
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** 解析成功后的中间结果 */
export type ParsedSnapshot<T> = {
	items: T[];
	fetchedAt?: string;
	accountRef?: string;
};

/** 读取成功后的结果 */
export type SnapshotResult<T> = ParsedSnapshot<T> & {
	/** 快照是否已超过 staleAfterDays 天 */
	stale: boolean;
};

export type ReadSnapshotOptions<T> = {
	/** 快照目录，相对项目根目录 */
	directory: string;
	/** 快照文件名 */
	file: string;
	/** 过期阈值（天） */
	staleAfterDays: number;
	/** 解析函数：内容不合法时返回 null */
	parse: (content: string) => ParsedSnapshot<T> | null;
	/** 日志前缀，用来区分是哪个功能在抱怨，例如 "anime" / "bilibili-coins" */
	label: string;
};

/**
 * 读取并解析一份快照。
 *
 * @returns 文件不存在、读盘失败或解析失败时返回 null —— 由调用方决定降级策略。
 *          这个函数只负责打印可操作的警告，不抛错：一份过期的追番列表
 *          仍然比空白页有用，没必要为它中断整次构建。
 */
export function readJsonSnapshot<T>(
	options: ReadSnapshotOptions<T>,
): SnapshotResult<T> | null {
	const { directory, file, staleAfterDays, parse, label } = options;

	// directory / file 已经在 resolve*Options 里校验过（不含 ..、文件名符合白名单），
	// 这里再拼一次是最后一道保险
	const snapshotPath = join(resolve(process.cwd(), directory), file);

	if (!existsSync(snapshotPath)) {
		console.warn(
			`[${label}] 未找到快照 ${snapshotPath}，改用降级数据。` +
				"先执行 `pnpm anime:sync --provider bilibili` 生成快照。",
		);
		return null;
	}

	let parsed: ParsedSnapshot<T> | null = null;
	try {
		parsed = parse(readFileSync(snapshotPath, "utf-8"));
	} catch (error) {
		console.warn(
			`[${label}] 读取快照 ${snapshotPath} 出错：${error instanceof Error ? error.message : error}`,
		);
		return null;
	}

	if (!parsed) {
		console.warn(`[${label}] 快照 ${snapshotPath} 解析失败，改用降级数据。`);
		return null;
	}

	// 过期只在构建日志里提醒，不改变行为
	let stale = false;
	if (parsed.fetchedAt) {
		const fetchedTime = new Date(parsed.fetchedAt).getTime();
		if (!Number.isNaN(fetchedTime)) {
			stale = (Date.now() - fetchedTime) / 86400000 >= staleAfterDays;
		}
	}

	if (stale) {
		console.warn(
			`[${label}] 快照 ${snapshotPath} 已超过 ${staleAfterDays} 天，` +
				"建议重新执行 `pnpm anime:sync --provider bilibili`。",
		);
	}

	return { ...parsed, stale };
}
