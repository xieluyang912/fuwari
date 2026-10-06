/**
 * 安全地加载本地 `.env` 到 process.env（给 `pnpm anime:sync` 用）。
 *
 * 自己写而不引 `dotenv`：这里只需要解析最朴素的 KEY=VALUE，
 * 为它多装一个依赖不划算。
 *
 * 两条刻意的保守行为：
 *   1. 已经存在于 `process.env` 的键不会被文件覆盖 ——
 *      CI 里用 secrets 注入的同名变量优先级更高；
 *   2. 读不到文件、解析出错都静默跳过 —— 没有 .env 是完全正常的情况。
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

export function loadEnvFile(envPath = join(projectRoot, ".env")) {
	if (!existsSync(envPath)) return;

	try {
		const content = readFileSync(envPath, "utf-8");
		for (const line of content.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;

			const eqIndex = trimmed.indexOf("=");
			if (eqIndex === -1) continue;

			const key = trimmed.slice(0, eqIndex).trim();
			let val = trimmed.slice(eqIndex + 1).trim();

			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1);
			}

			if (key && process.env[key] === undefined) {
				process.env[key] = val;
			}
		}
	} catch {
		// 读不到就当没有 .env，不影响公开追番的同步
	}
}
