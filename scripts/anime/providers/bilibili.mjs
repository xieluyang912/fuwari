/**
 * Bilibili 追番列表抓取提供方。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  接口
 * ─────────────────────────────────────────────────────────────────────────────
 *  GET https://api.bilibili.com/x/space/bangumi/follow/list
 *      ?type=1                固定 1（追番；2 是追剧）
 *      &follow_status=<1|2|3> 1 想看 / 2 在看 / 3 看过
 *      &vmid=<UID>
 *      &ps=<10..50>           单页大小
 *      &pn=<1..>              页码
 *
 *  请求头：
 *      User-Agent 合规桌面浏览器 UA（B 站会对空 UA 直接拒绝）
 *      Referer    https://space.bilibili.com/
 *      Cookie     SESSDATA=<...>;（仅当追番列表设为私密时才需要）
 *
 *  响应：
 *      { code: 0, data: { list: [...], total: N } }
 *      code 53013 / -401 → 追番列表被设为私密，需要合法的 SESSDATA
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  封面与防盗链
 * ─────────────────────────────────────────────────────────────────────────────
 *  B 站的图床（hdslb.com）对外站有严格的 Referer 校验，直接把 URL 贴到
 *  页面里大概率是破图。所以 `cover.mode: "local"` 时这里会在同步阶段
 *  把封面下载到 `public/assets/anime/covers/bili_<id>.<ext>`，
 *  页面只引用站内路径 —— 既不破图，也不给访客浏览器增加第三方请求。
 *
 *  下载时会给 URL 追加 B 站 CDN 自己的处理参数 `@220w_280h.webp`：
 *  真正干活的是 B 站的图片服务，本地不跑任何图片转码（不依赖 sharp），
 *  拿到的就是裁好尺寸的 webp，通常只有十几 KB。
 *
 * ⚠️ 本文件由 `pnpm anime:sync` 显式触发，绝不在 `astro build` 期间执行。
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const API_BASE = "https://api.bilibili.com/x/space/bangumi/follow/list";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 三种状态的抓取顺序。
 * B 站接口一次只能查一种 follow_status，所以要遍历三次。
 */
const STATUS_MAP = [
	{ followStatus: 2, status: "watching" },
	{ followStatus: 3, status: "completed" },
	{ followStatus: 1, status: "planned" },
];

/** `progress` 字段可能是 "看到第12话" 这种文字，也可能直接是数字 */
function parseBiliProgress(rawProgress) {
	if (typeof rawProgress === "number" && Number.isFinite(rawProgress)) {
		return Math.max(0, Math.floor(rawProgress));
	}
	if (typeof rawProgress === "string" && rawProgress.trim()) {
		const match = rawProgress.match(/(\d+)/);
		if (match) return Number.parseInt(match[1], 10) || 0;
	}
	return undefined;
}

/**
 * 从文件头魔数判断图片真实格式。
 *
 * 为什么不直接信 `content-type` 或 URL 后缀：B 站 CDN 加了 `@...webp`
 * 之后返回的仍可能是 JPEG，后缀和内容对不上；扩展名写错会让浏览器
 * 用错误的解码器。魔数是最可靠的判据。
 */
function detectImageExtension(buffer, contentType) {
	if (buffer && buffer.length >= 4) {
		if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
			return "jpg";
		if (
			buffer[0] === 0x89 &&
			buffer[1] === 0x50 &&
			buffer[2] === 0x4e &&
			buffer[3] === 0x47
		)
			return "png";
		if (
			buffer.length >= 12 &&
			buffer[0] === 0x52 &&
			buffer[1] === 0x49 &&
			buffer[2] === 0x46 &&
			buffer[3] === 0x46 &&
			buffer[8] === 0x57 &&
			buffer[9] === 0x45 &&
			buffer[10] === 0x42 &&
			buffer[11] === 0x50
		)
			return "webp";
		if (
			buffer[0] === 0x47 &&
			buffer[1] === 0x49 &&
			buffer[2] === 0x46 &&
			buffer[3] === 0x38
		)
			return "gif";
		if (buffer.length >= 12) {
			const sub = buffer.subarray(4, 12).toString("binary");
			if (sub === "ftypavif" || sub === "ftypavis") return "avif";
		}
	}

	if (contentType) {
		const ct = contentType.toLowerCase();
		if (ct.includes("image/webp")) return "webp";
		if (ct.includes("image/png")) return "png";
		if (ct.includes("image/jpeg") || ct.includes("image/jpg")) return "jpg";
		if (ct.includes("image/gif")) return "gif";
		if (ct.includes("image/avif")) return "avif";
	}

	return "webp";
}

/**
 * 把封面下载到站内。
 *
 * 追番封面和投币视频封面走的是同一套逻辑（同一个图床、同一个 Referer 校验、
 * 同一个魔数嗅探），只有「存到哪个目录」「文件名前缀」「要多大尺寸」不同，
 * 所以做成参数。
 *
 * @param {string} coverUrl 远程封面地址
 * @param {string} id 文件名里用的标识（番剧用 seasonId/mediaId，视频用 BV 号）
 * @param {object} options
 * @param {string} options.dir 相对项目根目录的目标目录
 * @param {string} options.prefix 文件名前缀
 * @param {string} options.size B 站 CDN 的处理参数，例如 "220w_280h" / "480w_270h"
 * @param {boolean} [options.useWebp] 是否追加 .webp
 * @returns 站内绝对路径；下载失败返回 undefined（调用方会保留远程 URL）
 */
async function downloadCoverLocally(coverUrl, id, options) {
	if (!coverUrl || !coverUrl.startsWith("http")) return undefined;

	const { dir, prefix, size, useWebp = true } = options;

	try {
		const coversDir = join(projectRoot, dir);
		if (!existsSync(coversDir)) mkdirSync(coversDir, { recursive: true });

		let targetUrl = coverUrl;
		// URL 里已经有 "@" 说明调用方自己指定过处理参数了，不要再叠一层
		if (useWebp !== false && size && !targetUrl.includes("@")) {
			targetUrl = `${targetUrl}@${size}.webp`;
		}

		const res = await fetch(targetUrl, {
			headers: {
				"User-Agent": USER_AGENT,
				// 图床校验的是这个 Referer，不是 space.bilibili.com
				Referer: "https://www.bilibili.com/",
			},
			signal: AbortSignal.timeout(10000),
		});
		if (!res.ok) return undefined;

		const buffer = Buffer.from(await res.arrayBuffer());
		const ext = detectImageExtension(buffer, res.headers.get("content-type"));
		const fileName = `${prefix}${id}.${ext}`;
		writeFileSync(join(coversDir, fileName), buffer);
		// 返回的站内路径要和 dir 对应：public/assets/... → /assets/...
		return `/${dir.replace(/^public\//, "")}/${fileName}`;
	} catch (error) {
		console.warn(`[Bilibili] 封面下载失败（${id}）：${error.message}`);
		return undefined;
	}
}

/** 抓取某一个 follow_status 下的全部分页 */
async function fetchFollowStatusList(
	vmid,
	followStatus,
	status,
	sessdata,
	options,
) {
	// 接口硬性上限 50，下限 10
	const pageSize = Math.min(Math.max(10, options.pageSize || 30), 50);
	const maxItems = options.maxItems || 300;
	const minDelayMs = options.minDelayMs || 300;

	const headers = {
		"User-Agent": USER_AGENT,
		Referer: "https://space.bilibili.com/",
		Accept: "application/json",
	};
	if (sessdata) headers.Cookie = `SESSDATA=${sessdata};`;

	let pn = 1;
	let hasMore = true;
	const collected = [];

	while (hasMore && collected.length < maxItems) {
		const url = `${API_BASE}?type=1&follow_status=${followStatus}&vmid=${encodeURIComponent(vmid)}&ps=${pageSize}&pn=${pn}`;

		let res;
		try {
			const response = await fetch(url, {
				headers,
				signal: AbortSignal.timeout(15000),
			});
			if (!response.ok) {
				console.warn(
					`   [Bilibili] HTTP ${response.status}（status=${status}）`,
				);
				break;
			}
			res = await response.json();
		} catch (error) {
			console.warn(
				`   [Bilibili] 网络错误（status=${status}）：${error.message}`,
			);
			break;
		}

		if (res?.code !== 0) {
			if (res?.code === 53013 || res?.code === -400 || res?.code === -401) {
				console.warn(
					`   [Bilibili] 追番列表可能是私密的（code ${res.code}）：${res.message}。` +
						"请在 .env 里提供有效的 BILI_SESSDATA。",
				);
			} else {
				console.warn(
					`   [Bilibili] 接口返回 code ${res?.code}：${res?.message}`,
				);
			}
			break;
		}

		const list = res?.data?.list;
		const total = res?.data?.total ?? 0;

		if (Array.isArray(list) && list.length > 0) {
			collected.push(...list);
			if (
				list.length < pageSize ||
				collected.length >= total ||
				collected.length >= maxItems
			) {
				hasMore = false;
			} else {
				pn++;
				await delay(minDelayMs);
			}
		} else {
			hasMore = false;
		}
	}

	return collected.map((item) => ({ item, status }));
}

/**
 * 抓取入口。
 * @returns {{ provider: "bilibili", accountRef: string, rawItems: object[] }}
 */
export async function fetchBilibiliData(bilibiliConfig) {
	const vmid = bilibiliConfig.vmid?.trim();
	if (!vmid) {
		throw new Error(
			"请在 animeConfig.providers.bilibili.vmid 里填写 B 站数字 UID",
		);
	}

	const sessdataEnvName = bilibiliConfig.sessdataEnv || "BILI_SESSDATA";
	const sessdata = process.env[sessdataEnvName] || "";
	const coverConfig = bilibiliConfig.cover || { mode: "local", useWebp: true };
	const requestOptions = bilibiliConfig.request || {};

	console.log(
		`[Bilibili] 开始同步 vmid=${vmid}（凭据：${sessdata ? "已提供 SESSDATA" : "仅公开数据"}）`,
	);

	const allEntries = [];
	for (const { followStatus, status } of STATUS_MAP) {
		console.log(
			`[Bilibili] 拉取状态 "${status}"（follow_status=${followStatus}）...`,
		);
		const entries = await fetchFollowStatusList(
			vmid,
			followStatus,
			status,
			sessdata,
			requestOptions,
		);
		allEntries.push(...entries);
		console.log(`[Bilibili] 状态 "${status}" 拿到 ${entries.length} 条。`);
	}

	console.log(`[Bilibili] 合计 ${allEntries.length} 条，开始归一化...`);

	const rawItems = [];

	for (const { item, status } of allEntries) {
		const title = item.title || "";
		if (!title.trim()) continue;

		const mediaId = item.media_id ? String(item.media_id) : undefined;
		const seasonId = item.season_id ? String(item.season_id) : undefined;
		const idKey = seasonId || mediaId || Math.random().toString(36).slice(2);

		const rating =
			typeof item.rating?.score === "number" && item.rating.score > 0
				? item.rating.score
				: 0;

		const watched = parseBiliProgress(item.progress);
		const total =
			typeof item.total_count === "number" && item.total_count > 0
				? item.total_count
				: 0;
		const progress = watched !== undefined ? { watched, total } : undefined;

		// 封面：先统一成 https，再按策略处理
		let cover = item.cover || "";
		if (cover) {
			if (cover.startsWith("http://"))
				cover = cover.replace("http://", "https://");
			if (cover.startsWith("//")) cover = `https:${cover}`;
		}

		if (coverConfig.mode === "local" && cover) {
			cover =
				(await downloadCoverLocally(cover, idKey, {
					dir: "public/assets/anime/covers",
					prefix: "bili_",
					size: "220w_280h",
					useWebp: coverConfig.useWebp,
				})) || cover;
		} else if (coverConfig.mode === "remote" && cover) {
			if (coverConfig.useWebp !== false && !cover.includes("@")) {
				cover = `${cover}@220w_280h.webp`;
			}
		} else if (coverConfig.mode === "none") {
			cover = "";
		}

		// 年份
		const rawDate = item.publish?.release_date || item.publish?.pub_time || "";
		let year = "";
		if (rawDate) {
			const match = String(rawDate).match(/(\d{4})/);
			if (match) year = match[1];
		}

		// 简介
		let description = item.evaluate || item.summary || "";
		if (description) description = description.replace(/\n+/g, " ").trim();

		// 制作 / 地区
		const studio =
			Array.isArray(item.areas) && item.areas.length > 0
				? item.areas[0]?.name
				: undefined;

		// 题材
		let genres = [];
		if (typeof item.styles === "string") {
			genres = item.styles.split(/[、,/\s]+/).filter(Boolean);
		} else if (Array.isArray(item.styles)) {
			genres = item.styles
				.map((s) => (typeof s === "string" ? s : s?.name))
				.filter(Boolean);
		}

		// 外链
		let link = item.url;
		if (!link) {
			if (mediaId) link = `https://www.bilibili.com/bangumi/media/md${mediaId}`;
			else if (seasonId)
				link = `https://www.bilibili.com/bangumi/play/ss${seasonId}`;
		}

		rawItems.push({
			title,
			status,
			rating,
			progress,
			cover: cover || undefined,
			link: link || undefined,
			description: description || undefined,
			year,
			studio,
			genres,
			identity: { provider: "bilibili", seasonId, sourceId: mediaId },
		});
	}

	return { provider: "bilibili", accountRef: vmid, rawItems };
}

/* ==========================================================================
 * 「我最近投币的视频」
 * ========================================================================== */

const COIN_API = "https://api.bilibili.com/x/space/coin/video";

/**
 * 抓取投币视频列表。
 *
 * ── 接口 ──────────────────────────────────────────────────────────────
 *  GET https://api.bilibili.com/x/space/coin/video?vmid=<UID>&pn=<页>&ps=<每页>
 *  响应：{ code: 0, data: [ ...视频对象 ] }
 *
 *  三个和追番接口不一样的地方，都值得记一笔：
 *
 *  1. **data 是裸数组**，不是 `{ list, total }`。所以没有 total 可比对，
 *     只能靠「这一页返回的条数够不够」判断有没有下一页。
 *  2. **不需要登录**。返回的是用户公开的投币记录 ——
 *     前提是他在隐私设置里把「投币视频」设为公开，否则 code 53013。
 *  3. **pn 实际上被忽略**（实测两个账号，pn=1 与 pn=2 返回完全相同的列表）。
 *     所以下面用「本页有没有新 bvid」来兜底：一旦整页都是见过的，
 *     就说明分页没生效或者已经到底了，立刻停手，不会无限翻页。
 *
 * @returns {{ provider: "bilibili", accountRef: string, rawItems: object[] }}
 */
export async function fetchBilibiliCoins(bilibiliConfig) {
	const vmid = bilibiliConfig.vmid?.trim();
	if (!vmid) {
		throw new Error(
			"请在 animeConfig.providers.bilibili.vmid 里填写 B 站数字 UID",
		);
	}

	const coinsConfig = bilibiliConfig.coins || {};
	const requestOptions = bilibiliConfig.request || {};
	const coverConfig = bilibiliConfig.cover || { mode: "local", useWebp: true };

	const pageSize = Math.min(Math.max(1, coinsConfig.pageSize || 20), 50);
	const maxItems = coinsConfig.maxItems || 12;
	const minDelayMs = requestOptions.minDelayMs || 300;

	console.log(
		`[Bilibili] 开始同步投币视频（vmid=${vmid}，最多 ${maxItems} 条）...`,
	);

	const headers = {
		"User-Agent": USER_AGENT,
		Referer: `https://space.bilibili.com/${vmid}/`,
		Accept: "application/json",
	};

	const collected = [];
	const seen = new Set();
	let pn = 1;

	while (collected.length < maxItems) {
		const url = `${COIN_API}?vmid=${encodeURIComponent(vmid)}&pn=${pn}&ps=${pageSize}`;

		let res;
		try {
			const response = await fetch(url, {
				headers,
				signal: AbortSignal.timeout(15000),
			});
			if (!response.ok) {
				console.warn(`   [Bilibili] 投币接口 HTTP ${response.status}`);
				break;
			}
			res = await response.json();
		} catch (error) {
			console.warn(`   [Bilibili] 投币接口网络错误：${error.message}`);
			break;
		}

		if (res?.code !== 0) {
			if (res?.code === 53013 || res?.code === -400 || res?.code === -401) {
				console.warn(
					`   [Bilibili] 投币列表不可见（code ${res.code}）：${res.message}。\n` +
						"      需要在 B 站「隐私设置 → 投币视频」里设为公开。",
				);
			} else {
				console.warn(
					`   [Bilibili] 投币接口返回 code ${res?.code}：${res?.message}`,
				);
			}
			break;
		}

		// data 是裸数组；拿不到数组就当作到底了
		const list = Array.isArray(res.data) ? res.data : [];
		if (list.length === 0) break;

		// 只收没见过的 —— 这也是「pn 被忽略」时的刹车
		const fresh = list.filter((item) => item?.bvid && !seen.has(item.bvid));
		if (fresh.length === 0) {
			console.log(
				"   [Bilibili] 本页没有新条目，视为已到列表末尾（该接口的 pn 参数不生效）。",
			);
			break;
		}

		for (const item of fresh) {
			seen.add(item.bvid);
			collected.push(item);
			if (collected.length >= maxItems) break;
		}

		// 返回条数不足一页，说明后面没有了
		if (list.length < pageSize) break;

		pn++;
		await delay(minDelayMs);
	}

	console.log(
		`[Bilibili] 投币视频共拿到 ${collected.length} 条，开始归一化...`,
	);

	const rawItems = [];

	for (const item of collected) {
		const bvid = item.bvid;
		const title = item.title || "";
		if (!bvid || !title.trim()) continue;

		// 封面：先统一成 https，再按策略处理
		let cover = item.pic || "";
		if (cover) {
			if (cover.startsWith("http://"))
				cover = cover.replace("http://", "https://");
			if (cover.startsWith("//")) cover = `https:${cover}`;
		}

		if (coverConfig.mode === "local" && cover) {
			cover =
				(await downloadCoverLocally(cover, bvid, {
					dir: "public/assets/bilibili/covers",
					prefix: "coin_",
					// 视频封面是 16:9，和番剧海报的竖版尺寸不一样
					size: "480w_270h",
					useWebp: coverConfig.useWebp,
				})) || cover;
		} else if (coverConfig.mode === "remote" && cover) {
			if (coverConfig.useWebp !== false && !cover.includes("@")) {
				cover = `${cover}@480w_270h.webp`;
			}
		} else if (coverConfig.mode === "none") {
			cover = "";
		}

		rawItems.push({
			bvid,
			title: title.trim(),
			cover: cover || undefined,
			author: item.owner
				? {
						mid: item.owner.mid ? String(item.owner.mid) : undefined,
						name: item.owner.name,
					}
				: undefined,
			duration: typeof item.duration === "number" ? item.duration : undefined,
			publishedAt: item.pubdate,
			// time 是「我投币的时间」，和视频自己的 pubdate 是两回事
			coinedAt: item.time,
			coins: item.coins,
			stats: item.stat
				? {
						view: item.stat.view,
						danmaku: item.stat.danmaku,
						like: item.stat.like,
						coin: item.stat.coin,
						favorite: item.stat.favorite,
					}
				: undefined,
			category: item.tnamev2 || item.tname || undefined,
			description: item.desc || undefined,
			link: `https://www.bilibili.com/video/${bvid}/`,
		});
	}

	return { provider: "bilibili", accountRef: vmid, rawItems };
}

/* ==========================================================================
 * 粉丝勋章
 * ========================================================================== */

/**
 * 勋章墙接口在 **live** 域下，不在 api.bilibili.com。
 * 路径里那个大写的 MedalWall 也是官方原样，别顺手改成小写。
 */
const MEDAL_WALL_API =
	"https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall";

/**
 * 抓取粉丝勋章。
 *
 * ── 这个接口必须登录 ──────────────────────────────────────────────────
 * 匿名请求一律返回 `{ code: -101, message: "账号未登录" }`。
 * 换域名、补参数、加 buvid3 Cookie、加 WBI 签名，全都不行 ——
 * 所以这一块没有免凭据的用法，必须配 .env：
 *
 *   BILI_SESSDATA="你的 SESSDATA"
 *
 * ⚠️ 没有凭据时**不发任何网络请求**，直接返回空数组并打印说明，
 *    让调用方保持现有快照不变。
 *
 * @returns {{ provider: "bilibili", accountRef: string, rawItems: object[] }}
 */
export async function fetchBilibiliMedals(bilibiliConfig) {
	const vmid = bilibiliConfig.vmid?.trim();
	if (!vmid) {
		throw new Error(
			"请在 animeConfig.providers.bilibili.vmid 里填写 B 站数字 UID",
		);
	}

	const sessdataEnvName = bilibiliConfig.sessdataEnv || "BILI_SESSDATA";
	const sessdata = process.env[sessdataEnvName] || "";

	if (!sessdata) {
		console.warn(
			"[Bilibili] 粉丝勋章需要登录凭据，已跳过。\n" +
				`      在项目根目录的 .env 里配置 ${sessdataEnvName}="你的 SESSDATA" 后重试。\n` +
				"      （勋章墙接口不接受匿名访问，这是唯一可行的方式）",
		);
		return { provider: "bilibili", accountRef: vmid, rawItems: [] };
	}

	console.log(`[Bilibili] 开始同步粉丝勋章（vmid=${vmid}）...`);

	let res;
	try {
		const response = await fetch(
			`${MEDAL_WALL_API}?target_id=${encodeURIComponent(vmid)}`,
			{
				headers: {
					"User-Agent": USER_AGENT,
					Referer: `https://space.bilibili.com/${vmid}/medal`,
					Accept: "application/json",
					Cookie: `SESSDATA=${sessdata};`,
				},
				signal: AbortSignal.timeout(15000),
			},
		);
		if (!response.ok) {
			console.warn(`   [Bilibili] 勋章墙 HTTP ${response.status}`);
			return { provider: "bilibili", accountRef: vmid, rawItems: [] };
		}
		res = await response.json();
	} catch (error) {
		console.warn(`   [Bilibili] 勋章墙网络错误：${error.message}`);
		return { provider: "bilibili", accountRef: vmid, rawItems: [] };
	}

	if (res?.code === -101) {
		console.warn(
			"   [Bilibili] 账号未登录：SESSDATA 无效或已过期。" +
				"请重新从浏览器取一个（登录后 F12 → Application → Cookies → SESSDATA）。",
		);
		return { provider: "bilibili", accountRef: vmid, rawItems: [] };
	}

	if (res?.code !== 0) {
		console.warn(`   [Bilibili] 勋章墙返回 code ${res?.code}：${res?.message}`);
		return { provider: "bilibili", accountRef: vmid, rawItems: [] };
	}

	const list = Array.isArray(res?.data?.list) ? res.data.list : [];
	console.log(`[Bilibili] 拿到 ${list.length} 枚勋章。`);

	// 主播头像不做本地化：一个勋章墙动辄几十个主播，每个都下一张图收益很低，
	// 而这些头像 URL 是公开可直连的
	return { provider: "bilibili", accountRef: vmid, rawItems: list };
}

/* ==========================================================================
 * 数字收藏集（装扮体系里的「收藏集」，不是收藏夹）
 * ========================================================================== */

const DLC_ACT_LIST_API = "https://api.bilibili.com/x/vas/dlc_act/act/list";
const DLC_ASSET_BAG_API = "https://api.bilibili.com/x/vas/dlc_act/asset_bag";

/**
 * ⚠️ 这一块和前面几块都不一样，先说清楚代价。
 *
 * B 站**没有**「列出我拥有哪些收藏集」的接口。查持有情况只能按 act_id 逐个问
 * （`asset_bag?act_id=&ruid=`），而收藏集目录实测有 **1500+ 个**。
 * 也就是说「找出我拥有哪些」这件事本身要发一千多个请求 ——
 * 实测这么做会**触发 B 站风控**，之后一段时间该系列接口直接返回 412。
 *
 * 所以这里做了两条路：
 *
 *   1. **刷新**（默认）：只重查已知的那几个 act_id。
 *      你有 12 个收藏集就只发 12 个请求，又快又不会触发风控。
 *      代价是「新抽到的收藏集」不会被发现。
 *
 *   2. **全量扫描**（`--scan-collections` 显式开启）：
 *      遍历整个目录找新的，代价见上。偶尔跑一次即可。
 *
 * 快照里保存的就是「我拥有的收藏集」清单，两条路共用同一份文件。
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 遍历收藏集目录，返回全部条目（约 80 个请求） */
async function fetchCollectionCatalog(headers) {
	const catalog = [];
	let site = 0;

	for (let guard = 0; guard < 200; guard++) {
		let json;
		try {
			const res = await fetch(
				`${DLC_ACT_LIST_API}?csrf=&scene=1&site=${site}`,
				{ headers, signal: AbortSignal.timeout(15000) },
			);
			if (!res.ok) {
				console.warn(`   [Bilibili] 收藏集目录 HTTP ${res.status}，停止翻页`);
				break;
			}
			json = await res.json();
		} catch (error) {
			console.warn(`   [Bilibili] 收藏集目录网络错误：${error.message}`);
			break;
		}

		if (json?.code !== 0) {
			console.warn(
				`   [Bilibili] 收藏集目录返回 code ${json?.code}：${json?.message}`,
			);
			break;
		}

		const list = Array.isArray(json.data?.list) ? json.data.list : [];
		catalog.push(...list);
		if (!json.data?.is_more || list.length === 0) break;
		site = json.data.site;
		await sleep(150);
	}

	return catalog;
}

/** 查某个收藏集里我拥有哪些卡；拿不到时返回 null */
async function fetchCollectionBag(actId, lotteryId, vmid, headers) {
	try {
		const res = await fetch(
			`${DLC_ASSET_BAG_API}?act_id=${actId}&lottery_id=${lotteryId ?? 0}&ruid=${vmid}`,
			{ headers, signal: AbortSignal.timeout(15000) },
		);
		if (!res.ok) return null;
		const json = await res.json();
		if (json?.code !== 0 || !json.data) return null;
		return json.data;
	} catch {
		return null;
	}
}

/** 把「目录条目 + 我的背包」合成一条扁平记录，交给 normalizeCollection 清洗 */
function toCollectionRecord(catalogEntry, bag) {
	const ownedCards = (bag?.item_list ?? [])
		.map((item) => item?.card_item)
		.filter(Boolean);

	return {
		act_id: catalogEntry.act_id,
		lottery_id: catalogEntry.lottery_id,
		act_name: catalogEntry.act_name,
		act_pic: catalogEntry.act_pic,
		act_desc: catalogEntry.act_desc,
		act_link: catalogEntry.act_link,
		act_y_img: bag?.act_y_img,
		owned_item_cnt: bag?.owned_item_cnt ?? 0,
		total_item_cnt: bag?.total_item_cnt ?? catalogEntry.total_item_cnt,
		item_list: ownedCards,
	};
}

/**
 * 抓取数字收藏集。
 *
 * @param {object} bilibiliConfig
 * @param {{known?: {actId: string, lotteryId?: string, name?: string}[], scan?: boolean}} options
 *        known：快照里已有的收藏集（刷新模式用）
 *        scan ：true 时遍历整个目录（显式 --scan-collections 才传）
 */
export async function fetchBilibiliCollections(bilibiliConfig, options = {}) {
	const vmid = bilibiliConfig.vmid?.trim();
	if (!vmid) {
		throw new Error(
			"请在 animeConfig.providers.bilibili.vmid 里填写 B 站数字 UID",
		);
	}

	const sessdataEnvName = bilibiliConfig.sessdataEnv || "BILI_SESSDATA";
	const sessdata = process.env[sessdataEnvName] || "";

	if (!sessdata) {
		console.warn(
			"[Bilibili] 收藏集需要登录凭据，已跳过。\n" +
				`      在项目根目录的 .env 里配置 ${sessdataEnvName}="你的 SESSDATA" 后重试。`,
		);
		return {
			provider: "bilibili",
			accountRef: vmid,
			rawItems: [],
			refreshedActIds: [],
			failedActIds: [],
		};
	}

	const headers = {
		"User-Agent": USER_AGENT,
		Referer: "https://www.bilibili.com/h5/mall/digital-card/home",
		Accept: "application/json",
		Cookie: `SESSDATA=${sessdata};`,
	};

	const known = Array.isArray(options.known) ? options.known : [];

	// ── 决定要查哪些 act_id ──
	/** @type {{act_id: string|number, lottery_id?: string|number, act_name?: string}[]} */
	let targets;

	if (options.scan) {
		console.log("[Bilibili] 开始遍历收藏集目录（全量扫描，会发较多请求）...");
		const catalog = await fetchCollectionCatalog(headers);
		console.log(
			`[Bilibili] 目录共 ${catalog.length} 个收藏集，逐个查询持有情况...`,
		);
		targets = catalog;
	} else if (known.length > 0) {
		console.log(
			`[Bilibili] 刷新已知的 ${known.length} 个收藏集（不发全量扫描）...`,
		);
		targets = known.map((item) => ({
			act_id: item.actId,
			lottery_id: item.lotteryId,
			act_name: item.name,
		}));
	} else {
		console.warn(
			"[Bilibili] 本地还没有收藏集快照，无法刷新。\n" +
				"      首次请执行：pnpm anime:sync --provider bilibili --scan-collections\n" +
				"      ⚠️ 全量扫描要遍历 1500+ 个收藏集，会发较多请求，且可能触发 B 站风控，偶尔跑一次即可。",
		);
		return {
			provider: "bilibili",
			accountRef: vmid,
			rawItems: [],
			refreshedActIds: [],
			failedActIds: [],
		};
	}

	// ── 逐个查持有情况 ──
	// 并发压到 3、每条之间留间隔：这一块本来就请求多，再猛冲只会触发风控
	const CONCURRENCY = 3;
	const rawItems = [];
	/** 查询成功的 act_id（含「确实没有卡」的），用于区分「该删」和「没查到」 */
	const refreshed = new Set();
	/** 查询失败（网络错误 / 风控 412）的 act_id，这些必须保留旧数据 */
	const failed = [];
	const queue = [...targets];
	let done = 0;

	async function worker() {
		while (queue.length > 0) {
			const entry = queue.shift();
			const actId = String(entry.act_id);
			const bag = await fetchCollectionBag(
				actId,
				entry.lottery_id,
				vmid,
				headers,
			);

			if (bag) {
				refreshed.add(actId);
				if ((bag.owned_item_cnt ?? 0) > 0) {
					rawItems.push(toCollectionRecord(entry, bag));
				}
			} else {
				failed.push(actId);
			}

			done++;
			if (done % 100 === 0) {
				console.log(
					`   ...已查 ${done}/${targets.length}，命中 ${rawItems.length}`,
				);
			}
			await sleep(120);
		}
	}

	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	console.log(
		`[Bilibili] 收藏集查询完毕：查了 ${targets.length} 个，我拥有卡牌的有 ${rawItems.length} 个。`,
	);

	return { provider: "bilibili", accountRef: vmid, rawItems };
}
