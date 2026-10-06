/**
 * 追番列表同步入口。
 *
 *   用法：pnpm anime:sync [--provider bilibili] [--if-stale]
 *
 * 流程：读配置 → 调 provider 抓数据 → 归一化 → 敏感串扫描 → 原子落盘。
 *
 * 几条刻意的设计：
 *   - 这是**唯一**会访问外部接口的地方。页面渲染和 astro build 全程离线，
 *     所以 B 站挂了不会导致博客构建失败；
 *   - 抓取为空时不覆盖已有快照（除非把 snapshot.keepLastValid 关掉），
 *     一次接口抖动不至于把线上番剧页清空；
 *   - 落盘前扫描 SESSDATA / cookie / token 之类的敏感串，命中就报错退出。
 *     凭据只该存在于 process.env，绝不该出现在要提交进 Git 的快照里；
 *   - 「没配置」「保留了旧快照」都以退出码 0 结束，不会无谓地中断部署流水线。
 *
 * provider 里直接 import 主题的 TS 配置（Node 24 原生类型擦除）。
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	animeConfig,
	resolveAnimeOptions,
} from "../../src/config/animeConfig.ts";
import {
	normalizeAnimeItem,
	sortAnimeList,
} from "../../src/utils/anime/normalize.ts";
import {
	dedupeBilibiliVideos,
	dedupeFanMedals,
	normalizeBilibiliVideo,
	normalizeCollection,
	normalizeFanMedal,
	sortBilibiliVideos,
	sortFanMedals,
} from "../../src/utils/bilibili/normalize.ts";
import { loadEnvFile } from "./load-env.mjs";
import {
	fetchBilibiliCoins,
	fetchBilibiliCollections,
	fetchBilibiliData,
	fetchBilibiliMedals,
} from "./providers/bilibili.mjs";
import { commitSnapshot, isSnapshotStale } from "./snapshot-store.mjs";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

loadEnvFile();

/** 一旦这些串出现在快照里，说明凭据泄漏了，宁可不同步 */
const SENSITIVE_PATTERNS = [
	/\bSESSDATA\b/i,
	/\bcookie\s*[:=]/i,
	/\bauthorization\s*[:=]/i,
	/\baccess_token\b/i,
	/\brefresh_token\b/i,
	/\bcsrf\b/i,
];

function scanForSensitiveData(jsonString) {
	for (const pattern of SENSITIVE_PATTERNS) {
		if (pattern.test(jsonString)) {
			throw new Error(
				`安全拦截：快照数据里出现了不该有的敏感串 ${pattern}，已中止写入。`,
			);
		}
	}
}

/** provider 是否已经配好（启用 + 填了非占位 ID） */
function isProviderConfigured(providerName) {
	if (providerName === "bilibili") {
		const config = animeConfig.providers?.bilibili;
		return Boolean(
			config?.enable && config.vmid && config.vmid !== "your-bilibili-vmid",
		);
	}
	return false;
}

/**
 * 把一份数据原子落盘，带上敏感串扫描与空结果保护。
 * 追番和投币视频走的是同一套流程，所以抽出来共用。
 */
function writeSnapshot({
	targetFile,
	jsonContent,
	itemCount,
	keepLastValid,
	label,
}) {
	scanForSensitiveData(jsonContent);

	const tempFile = join(
		dirname(targetFile),
		`.temp-${basename(targetFile)}-${Date.now()}`,
	);

	const outcome = commitSnapshot({
		targetFile,
		tempFile,
		jsonContent,
		itemCount,
		keepLastValid,
	});

	if (outcome === "kept") {
		console.warn(
			`[anime-sync] ⚠ ${label} 抓到 0 条，已保留上一份有效快照：${targetFile}\n` +
				"（原因是 snapshot.keepLastValid = true；想允许空快照就把它改成 false）",
		);
		return;
	}

	console.log(`[anime-sync] ✓ ${label} 已写入 ${itemCount} 条到 ${targetFile}`);
}

async function syncProvider(
	providerName,
	targetDir,
	keepLastValid,
	scanCollections,
) {
	console.log("\n========================================");
	console.log(`开始同步 provider：${providerName.toUpperCase()}`);
	console.log("========================================");

	const config = animeConfig.providers?.bilibili;
	if (!config?.vmid) {
		throw new Error("animeConfig.providers.bilibili.vmid 未配置");
	}
	const fetchResult = await fetchBilibiliData(config);

	const normalizedItems = [];
	for (const rawItem of fetchResult.rawItems) {
		const item = normalizeAnimeItem(rawItem);
		if (item) normalizedItems.push(item);
	}
	const sortedItems = sortAnimeList(normalizedItems);

	writeSnapshot({
		targetFile: join(targetDir, `${providerName}.json`),
		jsonContent: JSON.stringify(
			{
				schemaVersion: 1,
				provider: providerName,
				fetchedAt: new Date().toISOString(),
				accountRef: String(fetchResult.accountRef || ""),
				items: sortedItems,
			},
			null,
			2,
		),
		itemCount: sortedItems.length,
		keepLastValid,
		label: `provider "${providerName}"`,
	});

	// 投币视频：另一个接口、另一份快照，跟着一起同步
	await syncCoins(config, targetDir, keepLastValid);

	// 粉丝勋章：同上（这一块必须配 SESSDATA）
	await syncMedals(config, targetDir);

	// 数字收藏集：默认只刷新已知的，--scan-collections 才全量扫描
	await syncCollections(config, targetDir, { scan: scanCollections });
}

/**
 * 同步「我的粉丝勋章」。
 *
 * 快照写在 `<snapshot.directory>/<medals.file>`（默认 bilibili-medals.json）。
 * 没有凭据或抓不到时**不写文件**，保持上一次的有效快照。
 */
async function syncMedals(bilibiliConfig, targetDir) {
	const medalsConfig = bilibiliConfig.medals;
	if (!medalsConfig?.enable) {
		console.log(
			"\n[anime-sync] 粉丝勋章同步未启用（providers.bilibili.medals.enable = false），跳过。",
		);
		return;
	}

	console.log("\n========================================");
	console.log("开始同步：我的粉丝勋章");
	console.log("========================================");

	const fetchResult = await fetchBilibiliMedals(bilibiliConfig);

	if (fetchResult.rawItems.length === 0) {
		console.log("[anime-sync] 没有拿到勋章，保持现有快照不变。");
		return;
	}

	const normalizedItems = [];
	for (const rawItem of fetchResult.rawItems) {
		const medal = normalizeFanMedal(rawItem);
		if (medal) normalizedItems.push(medal);
	}
	const sortedItems = sortFanMedals(dedupeFanMedals(normalizedItems));

	const file = medalsConfig.file || "bilibili-medals.json";

	writeSnapshot({
		targetFile: join(targetDir, file),
		jsonContent: JSON.stringify(
			{
				schemaVersion: 1,
				provider: "bilibili",
				kind: "medals",
				fetchedAt: new Date().toISOString(),
				accountRef: String(fetchResult.accountRef || ""),
				items: sortedItems,
			},
			null,
			2,
		),
		itemCount: sortedItems.length,
		keepLastValid: false,
		label: "粉丝勋章",
	});
}

/**
 * 同步「我最近投币的视频」。
 *
 * 快照写在 `<snapshot.directory>/<coins.file>`（默认 bilibili-coins.json），
 * 和追番快照并列。
 */
async function syncCoins(bilibiliConfig, targetDir, keepLastValid) {
	const coinsConfig = bilibiliConfig.coins;
	if (!coinsConfig?.enable) {
		console.log(
			"\n[anime-sync] 投币视频同步未启用（providers.bilibili.coins.enable = false），跳过。",
		);
		return;
	}

	console.log("\n========================================");
	console.log("开始同步：最近投币的视频");
	console.log("========================================");

	const fetchResult = await fetchBilibiliCoins(bilibiliConfig);

	const normalizedItems = [];
	for (const rawItem of fetchResult.rawItems) {
		const item = normalizeBilibiliVideo(rawItem);
		if (item) normalizedItems.push(item);
	}
	const sortedItems = sortBilibiliVideos(dedupeBilibiliVideos(normalizedItems));

	const file = coinsConfig.file || "bilibili-coins.json";

	writeSnapshot({
		targetFile: join(targetDir, file),
		jsonContent: JSON.stringify(
			{
				schemaVersion: 1,
				provider: "bilibili",
				kind: "coins",
				fetchedAt: new Date().toISOString(),
				accountRef: String(fetchResult.accountRef || ""),
				items: sortedItems,
			},
			null,
			2,
		),
		itemCount: sortedItems.length,
		keepLastValid,
		label: "投币视频",
	});
}

function parseCliArgs() {
	const args = process.argv.slice(2);
	let provider = null;
	let ifStale = false;
	let scanCollections = false;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--provider" && args[i + 1]) {
			provider = args[i + 1].toLowerCase();
			i++;
		} else if (args[i].startsWith("--provider=")) {
			provider = args[i].split("=")[1].toLowerCase();
		} else if (args[i] === "--if-stale") {
			ifStale = true;
		} else if (args[i] === "--scan-collections") {
			scanCollections = true;
		}
	}

	return { provider, ifStale, scanCollections };
}

async function main() {
	const resolved = resolveAnimeOptions(animeConfig);
	const { provider: cliProvider, ifStale, scanCollections } = parseCliArgs();

	const targetDir = join(projectRoot, resolved.snapshot.directory);

	let providersToSync = [];
	if (cliProvider === "bilibili") {
		providersToSync = ["bilibili"];
	} else if (cliProvider === "all") {
		// 目前只实现了 B 站一家；写 all 就是同步全部已启用的 provider
		providersToSync = ["bilibili"].filter(isProviderConfigured);
	} else if (resolved.source.kind === "snapshot" && resolved.source.provider) {
		if (isProviderConfigured(resolved.source.provider)) {
			providersToSync = [resolved.source.provider];
		} else {
			console.log(
				`[anime-sync] source.provider 指定的 "${resolved.source.provider}" 未启用或 ID 仍是占位值，跳过。`,
			);
			process.exit(0);
		}
	} else {
		if (isProviderConfigured("bilibili")) providersToSync.push("bilibili");
		if (providersToSync.length === 0) {
			console.log("[anime-sync] 没有已启用且填好 ID 的 provider。");
			console.log(
				"用法：node scripts/anime/sync.mjs --provider <bilibili|all>",
			);
			process.exit(0);
		}
	}

	if (ifStale) {
		providersToSync = providersToSync.filter((p) =>
			isSnapshotStale(
				join(targetDir, `${p}.json`),
				resolved.snapshot.staleAfterDays,
			),
		);
		if (providersToSync.length === 0) {
			console.log(
				`[anime-sync] 所有快照都在 ${resolved.snapshot.staleAfterDays} 天内，--if-stale 下跳过同步。`,
			);
			process.exit(0);
		}
	}

	let hasError = false;
	for (const provider of providersToSync) {
		try {
			await syncProvider(
				provider,
				targetDir,
				resolved.snapshot.keepLastValid,
				scanCollections,
			);
		} catch (error) {
			hasError = true;
			console.error(
				`[anime-sync] ✘ provider "${provider}" 同步失败：`,
				error.message,
			);
		}
	}

	if (hasError) process.exit(1);
}

main().catch((err) => {
	console.error("[anime-sync] 致命错误：", err);
	process.exit(1);
});

/**
 * 同步「数字收藏集」。
 *
 * ⚠️ 这里的「收藏集」是 B 站装扮体系里的数字卡牌产品，**不是收藏夹**。
 *
 * 两种模式（详见 providers/bilibili.mjs 里的说明）：
 *   - 默认：只重查快照里已知的那些 act_id，请求数与「你有几个收藏集」成正比；
 *   - \`--scan-collections\`：遍历整个目录（1500+ 个）找新的，
 *     请求量大且可能触发 B 站风控，偶尔跑一次即可。
 *
 * 拿不到结果时**不写文件**，保持上一次的有效快照。
 */
async function syncCollections(bilibiliConfig, targetDir, { scan }) {
	const collectionsConfig = bilibiliConfig.collections;
	if (!collectionsConfig?.enable) {
		console.log(
			"\n[anime-sync] 收藏集同步未启用（providers.bilibili.collections.enable = false），跳过。",
		);
		return;
	}

	console.log("\n========================================");
	console.log(
		"开始同步：数字收藏集" + (scan ? "（全量扫描）" : "（刷新已知）"),
	);
	console.log("========================================");

	const file = collectionsConfig.file || "bilibili-collections.json";
	const targetFile = join(targetDir, file);

	// 读现有快照，作为「已知收藏集」的来源
	let known = [];
	if (existsSync(targetFile)) {
		try {
			const existing = JSON.parse(readFileSync(targetFile, "utf-8"));
			known = (Array.isArray(existing?.items) ? existing.items : [])
				.filter((item) => item && item.actId)
				.map((item) => ({
					actId: String(item.actId),
					lotteryId: item.lotteryId,
					name: item.name,
					// 原样留着：这个收藏集这次没查成功时，直接把旧数据放回去
					__raw: item,
				}));
		} catch {
			known = [];
		}
	}

	const fetchResult = await fetchBilibiliCollections(bilibiliConfig, {
		known,
		scan,
	});

	/*
	 * ⚠️ 这里必须是「合并」而不是「替换」。
	 *
	 * 刷新模式下每个收藏集是一次独立请求，而 B 站会风控 ——
	 * 实测触发后大部分请求直接返回 412。如果用这次的结果覆盖快照，
	 * 那些「没查成功」的收藏集就被静默删掉了：一次刷新清空大半。
	 *
	 * 所以按 actId 合并：
	 *   - 查成功的：用新数据（确实没卡了才从列表里去掉）
	 *   - 查失败的：原样保留旧数据
	 */
	const freshByActId = new Map();
	for (const rawItem of fetchResult.rawItems) {
		const item = normalizeCollection(rawItem);
		if (item) freshByActId.set(item.actId, item);
	}

	const refreshedActIds = new Set(fetchResult.refreshedActIds ?? []);
	const failedCount = fetchResult.failedActIds?.length ?? 0;

	/** @type {Map<string, object>} */
	const merged = new Map();

	if (scan) {
		// 全量扫描本身就是完整结果，直接用
		for (const [actId, item] of freshByActId) merged.set(actId, item);
	} else {
		for (const entry of known) {
			const fresh = freshByActId.get(entry.actId);
			if (fresh) {
				merged.set(entry.actId, fresh);
				continue;
			}
			// 只有「查成功但确实没卡」才丢弃；查失败的保留旧数据
			if (!refreshedActIds.has(entry.actId) && entry.__raw) {
				merged.set(entry.actId, entry.__raw);
			}
		}
	}

	const normalizedItems = [...merged.values()];

	if (normalizedItems.length === 0) {
		console.log("[anime-sync] 没有拿到收藏集，保持现有快照不变。");
		return;
	}

	if (failedCount > 0 && !scan) {
		console.warn(
			`[anime-sync] ⚠ 有 ${failedCount} 个收藏集这次没查成功（多半是触发了 B 站风控），` +
				"已保留它们的旧数据。过一段时间再同步即可。",
		);
	}

	writeSnapshot({
		targetFile,
		jsonContent: JSON.stringify(
			{
				schemaVersion: 1,
				provider: "bilibili",
				kind: "collections",
				fetchedAt: new Date().toISOString(),
				accountRef: String(fetchResult.accountRef || ""),
				items: normalizedItems,
			},
			null,
			2,
		),
		itemCount: normalizedItems.length,
		keepLastValid: false,
		label: "数字收藏集",
	});
}
