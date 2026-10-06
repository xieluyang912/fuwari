/**
 * 快照落盘：决定「这次抓取结果怎么写到磁盘」。
 *
 * 契约（相对 `src/data/anime-snapshots/`）：
 *   - `<provider>.json` 是 `anime:sync` 的**唯一**写入目标，语义是
 *     「基线 / last-known-good」；
 *   - 自定义的 `source.file`（比如手工维护的 `manual.json`）属于使用者输入，
 *     同步脚本永远不碰它。
 *
 * 空结果不覆盖有效快照，这一点很重要：B 站接口偶尔会返回空列表
 * （限流、风控、服务抖动），如果照常落盘，一次抖动就会把线上的番剧页清空。
 */

import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

/**
 * 读取目标快照当前的条目数。
 * 文件缺失、损坏、没有 items 数组，都算 0 条 —— 它们都不构成「有效快照」，
 * 也就不值得为它们触发 keepLastValid 保护。
 */
export function readSnapshotItemCount(filePath) {
	if (!existsSync(filePath)) return 0;
	try {
		const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
		return Array.isArray(parsed?.items) ? parsed.items.length : 0;
	} catch {
		return 0;
	}
}

/**
 * 落盘决策 + 原子写入。
 *
 * - 结果为空 + keepLastValid + 已存在非空快照 → 保留旧档，返回 "kept"，不写文件；
 * - 其余情况 → 先写临时文件再 rename（原子替换），返回 "written"。
 *
 * 用 rename 而不是直接覆盖：同步中途被 Ctrl+C 或磁盘写满时，
 * 现场留下的只是一个临时文件，线上那份快照仍然是完整的。
 *
 * @returns {"written" | "kept"}
 */
export function commitSnapshot({
	targetFile,
	tempFile,
	jsonContent,
	itemCount,
	keepLastValid,
}) {
	if (
		itemCount === 0 &&
		keepLastValid &&
		readSnapshotItemCount(targetFile) > 0
	) {
		return "kept";
	}

	mkdirSync(dirname(targetFile), { recursive: true });

	try {
		writeFileSync(tempFile, jsonContent, "utf-8");
		renameSync(tempFile, targetFile);
		return "written";
	} catch (err) {
		if (existsSync(tempFile)) {
			try {
				unlinkSync(tempFile);
			} catch {
				// 清理失败无所谓，下次同步会覆盖
			}
		}
		throw err;
	}
}

/**
 * 判断快照是否过期 —— `--if-stale` 的过滤依据。
 *
 * 文件缺失 / 解析失败 / 没有 fetchedAt / 时间戳非法，一律视为过期（该同步了）。
 * 未来时间（时钟偏差）算出负的 ageDays，视为新鲜。
 */
export function isSnapshotStale(snapshotFile, staleAfterDays) {
	if (!existsSync(snapshotFile)) return true;
	try {
		const content = JSON.parse(readFileSync(snapshotFile, "utf8"));
		const fetchedAt = content.fetchedAt;
		if (!fetchedAt) return true;
		const fetchedTime = new Date(fetchedAt).getTime();
		if (Number.isNaN(fetchedTime)) return true;
		const ageDays = (Date.now() - fetchedTime) / (1000 * 60 * 60 * 24);
		return ageDays >= staleAfterDays;
	} catch {
		return true;
	}
}
