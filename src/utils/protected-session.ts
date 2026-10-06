/**
 * 记住「这篇已经解锁过了」，免得访客在站内来回翻页时反复输密码。
 *
 * 缓存的是派生出来的**密钥**，不是密码，也不是明文：
 *  - 不存密码：密码只在内存里活过一次 PBKDF2 的时间，永不出现在存储里。
 *  - 不存明文：明文只在内存里，关掉标签页就没了。
 * 存密钥的额外好处是省掉了下次的 31 万次 PBKDF2 —— 那次派生才是解锁慢的原因。
 *
 * 用 sessionStorage 而不是 localStorage：作用域仅限当前标签页，
 * 关掉浏览器就失效。这是有意的 —— 别让「一次解锁」变成永久免密。
 *
 * 需要说明的是：能拿到这个密钥的人就能解开这篇文章，
 * 所以它和密码一样是「凭据」。这只是为了体验，
 * 不构成对抗本机恶意程序的安全边界。
 */

const STORAGE_PREFIX = "fuwari:protected:v1:";
/** 缓存有效期。超过就得重新输密码 */
const TTL_MS = 30 * 60 * 1000;

interface CachedSession {
	v: 1;
	scope: string;
	payloadId: string;
	/** 派生密钥的裸字节（base64url） */
	rawKey: string;
	expiresAt: number;
}

/**
 * sessionStorage 在隐私模式、被禁用 Cookie 等情况下会直接抛异常。
 * 这时候退化成一份「只在本次页面会话里有效」的内存缓存：
 * 页面内跳转（本站用 Swup 做无刷新跳转，不会重新加载文档）依然够用，
 * 只是刷新后要重新输密码。
 */
const memoryFallback = new Map<string, CachedSession>();

function storageKey(scope: string): string {
	return STORAGE_PREFIX + encodeURIComponent(scope);
}

function safeWrite(key: string, value: string): void {
	try {
		sessionStorage.setItem(key, value);
	} catch {
		// 写不进去就只走内存缓存
	}
}

function safeRemove(key: string): void {
	try {
		sessionStorage.removeItem(key);
	} catch {
		// 忽略
	}
	memoryFallback.delete(key);
}

/**
 * 读缓存。返回 null 表示「没缓存 / 过期了 / 是别的文章留下的」。
 *
 * payloadId 用来确认这份缓存确实是给当前这版密文准备的：
 * 文章改了、密码换了，密文就变了，旧密钥自然也不该再拿来用。
 */
export function readCachedKey(scope: string, payloadId: string): string | null {
	const key = storageKey(scope);
	let entry: CachedSession | null = null;

	try {
		const raw = sessionStorage.getItem(key);
		if (raw) entry = JSON.parse(raw) as CachedSession;
	} catch {
		entry = null;
	}
	if (!entry) entry = memoryFallback.get(key) ?? null;

	if (!entry || entry.v !== 1) return null;
	if (entry.scope !== scope || entry.payloadId !== payloadId) return null;
	if (typeof entry.rawKey !== "string" || entry.rawKey.length === 0)
		return null;

	if (typeof entry.expiresAt !== "number" || Date.now() > entry.expiresAt) {
		// 过期了就顺手清掉，别留着占地方
		safeRemove(key);
		return null;
	}

	return entry.rawKey;
}

/** 解锁成功后写入缓存 */
export function writeCachedKey(
	scope: string,
	payloadId: string,
	rawKey: string,
): void {
	const key = storageKey(scope);
	const entry: CachedSession = {
		v: 1,
		scope,
		payloadId,
		rawKey,
		expiresAt: Date.now() + TTL_MS,
	};
	memoryFallback.set(key, entry);
	safeWrite(key, JSON.stringify(entry));
}

/** 清掉某篇文章的解锁状态 */
export function clearCachedKey(scope: string): void {
	safeRemove(storageKey(scope));
}
