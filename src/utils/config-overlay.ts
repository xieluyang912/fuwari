/**
 * 配置覆盖层：把「用户覆盖」合并进「主题默认值」。
 *
 * 每个 `*Config.ts` 把自己的默认值字面量交给 `withUserConfig()`，
 * 用户侧只需要在 `src/user/user-config.ts` 里写想改的字段。
 *
 * 合并规则：**对象递归合并，数组整体替换**（原因见 user-config.ts 的注释）。
 *
 * ⚠️ 这个模块会被 `astro.config.mjs` 间接加载（它 import 了 `src/config.ts`），
 *    也会被 `scripts/anime/sync.mjs` 用 Node 直接加载（Node 24 的类型擦除），
 *    所以这里**只能用最朴素的 ESM**：
 *      - import 路径要带 `.ts` 扩展名（Node 的 ESM 解析器不做扩展名补全）；
 *      - 不能出现 `import.meta.glob`、`import.meta.env`、Node 内置模块
 *        等依赖具体构建环境的写法。
 */

import { userConfigOverrides } from "../user/user-config.ts";

/** 只有「纯对象」才递归合并（数组、Date、null 都直接整体替换） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: unknown, override: unknown): unknown {
	if (!isPlainObject(base) || !isPlainObject(override)) return override;

	const merged: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(override)) {
		merged[key] = key in base ? deepMerge(base[key], value) : value;
	}
	return merged;
}

/**
 * 返回「主题默认值 ⊕ 用户覆盖」。
 * 用户没有覆盖这个领域时原样返回 `defaults`（零额外开销）。
 *
 * @param domain 领域名，与 `src/user/user-config.ts` 里的键一一对应
 * @param defaults 该领域的主题默认值字面量
 */
export function withUserConfig<T>(domain: string, defaults: T): T {
	const override = userConfigOverrides[domain];
	if (override === undefined) return defaults;
	return deepMerge(defaults, override) as T;
}
