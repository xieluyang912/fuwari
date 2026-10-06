/**
 * 文章加密 / 解密。
 *
 * 思路是「构建时加密，浏览器里解密」：
 *  - 构建时（Node）把文章正文的 HTML 用密码派生出密钥加密，
 *    密文写进静态页面；正文的明文永远不落进 dist/。
 *  - 访客打开文章时看到密码框，输入密码后由浏览器用 Web Crypto
 *    解开密文，再把 HTML 注入页面。
 *
 * 所以这个文件同时跑在 Node 和浏览器里，只能用两边都有的 API
 * （globalThis.crypto、btoa/atob、TextEncoder），不能 import node:crypto。
 *
 * ⚠️ 关于安全性的实话：
 * 静态站点没有后端，密文是公开的，任何人都可以把它下载下来
 * 离线暴力破解。PBKDF2 迭代 31 万次能把破解成本抬高不少，
 * 但密码本身太弱（比如 "123456"）依然会被秒破。
 * 这个功能的目标是「挡住随便点进来的访客」，不是对抗有动机的攻击者。
 * 真正的机密别往上放。
 */

import {
	PROTECTED_CONTENT_VERSION,
	type ProtectedContentType,
	type ProtectedPayload,
	parseProtectedPayload,
} from "@/types/protected-content";

/**
 * PBKDF2 迭代次数，参考 OWASP 对 PBKDF2-SHA256 的建议值。
 * 每次加密都会写进 payload，所以以后想调这个数字不会让旧文章解不开。
 *
 * 代价：访客点「解锁」后要等大约 0.2~1 秒（手机慢一些），这是故意的 ——
 * 暴力破解的一方也要付同样的代价。
 */
export const PROTECTED_ITERATIONS = 310_000;

const SALT_BYTES = 16;
const IV_BYTES = 12;
/** AES-GCM 的认证标签长度（bit），也是密文长度的下限 */
const TAG_BITS = 128;
const KEY_BITS = 256;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * 明确「底层是 ArrayBuffer 的字节数组」。
 *
 * TypeScript 5.7 之后 Uint8Array 带了泛型参数，默认的 Uint8Array 是
 * Uint8Array<ArrayBufferLike>（可能是 SharedArrayBuffer），而 Web Crypto 的
 * 参数要求 ArrayBufferView<ArrayBuffer> —— 两者不兼容。下面一律用这个别名，
 * 免得每个调用点都要单独断言。
 */
type Bytes = Uint8Array<ArrayBuffer>;

/** 失败原因，供界面区分提示文案 */
export type ProtectedErrorCode =
	| "unsupported"
	| "invalid-payload"
	| "wrong-password";

export class ProtectedContentError extends Error {
	code: ProtectedErrorCode;

	constructor(code: ProtectedErrorCode, message?: string) {
		super(message ?? code);
		this.name = "ProtectedContentError";
		this.code = code;
	}
}

/* ------------------------------------------------------------------ *
 * 编码工具：Web Crypto 只认字节，而 payload 要写成 JSON，所以中间
 * 用 base64url 过渡（比普通 base64 更省心，不用管 + / 在 URL 里的转义）
 * ------------------------------------------------------------------ */

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function fromBase64Url(value: string): Bytes {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	// atob 要求长度是 4 的倍数，补齐被去掉的 "="
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/**
 * 把字符串编码成字节。
 *
 * 不直接用 encoder.encode()，是因为它返回的类型是 Uint8Array<ArrayBufferLike>
 * （底层可能是 SharedArrayBuffer），而 Web Crypto 的参数要求 ArrayBufferView<ArrayBuffer>。
 * 拷贝一份到明确由 ArrayBuffer 支撑的数组上，类型和运行时都干净。
 */
function encodeUtf8(text: string): Bytes {
	const encoded = encoder.encode(text);
	const bytes = new Uint8Array(encoded.length);
	bytes.set(encoded);
	return bytes;
}

/**
 * 取 Web Crypto。
 *
 * crypto.subtle 只在「安全上下文」里存在：https 和 localhost 有，
 * 用 http 直连 IP 调试时没有。那种情况下要给出明确提示，
 * 而不是抛一个看不懂的 TypeError。
 */
function requireSubtle(): SubtleCrypto {
	const subtle = globalThis.crypto?.subtle;
	if (!subtle) {
		throw new ProtectedContentError(
			"unsupported",
			"Web Crypto is unavailable (the page must be served over https or localhost)",
		);
	}
	return subtle;
}

function randomBytes(length: number): Bytes {
	const bytes = new Uint8Array(length);
	globalThis.crypto.getRandomValues(bytes);
	return bytes;
}

/**
 * AAD（附加认证数据）：把密文和「它是哪篇文章」绑在一起。
 *
 * AES-GCM 会把 AAD 一起纳入认证标签的计算 —— 只有 AAD 完全一致才能解开。
 * 于是别人即使把 A 文章的密文原样搬到 B 文章的页面里，也解不出东西，
 * 拿不到「把某段密文换个地方就能显示出别的文章」这种玩法。
 */
function buildAdditionalData(scope: string, version: number): Bytes {
	return encodeUtf8(`fuwari-protected-content:${version}:${scope}`);
}

/**
 * 从密码派生 AES-GCM 密钥。
 *
 * extractable 传 true 是为了能把派生结果导出成裸密钥缓存在
 * sessionStorage 里（见 utils/protected-session.ts）—— 这样同一标签页里
 * 来回翻页不用把 31 万次 PBKDF2 重跑一遍。
 */
async function deriveKey(
	password: string,
	salt: Bytes,
	iterations: number,
): Promise<CryptoKey> {
	const subtle = requireSubtle();
	const baseKey = await subtle.importKey(
		"raw",
		encodeUtf8(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations, hash: "SHA-256" },
		baseKey,
		{ name: "AES-GCM", length: KEY_BITS },
		true,
		["encrypt", "decrypt"],
	);
}

/** 导出密钥的裸字节，用于写进 sessionStorage 缓存 */
async function exportRawKey(key: CryptoKey): Promise<string> {
	return toBase64Url(
		new Uint8Array(await requireSubtle().exportKey("raw", key)),
	);
}

/** 把缓存的裸密钥重新变回 CryptoKey */
async function importRawKey(rawKey: string): Promise<CryptoKey> {
	return requireSubtle().importKey(
		"raw",
		fromBase64Url(rawKey),
		"AES-GCM",
		false,
		["decrypt"],
	);
}

/* ------------------------------------------------------------------ *
 * 对外接口
 * ------------------------------------------------------------------ */

/**
 * 构建时调用：把正文 HTML 加密成 payload。
 *
 * 同一个密码、同一篇正文，每次构建得到的密文都不一样 ——
 * 因为 salt 和 iv 每次都重新随机。这两条随机性来自两条不同的要求：
 * iv 是 AES-GCM 的（同一把密钥下重复会直接破坏它的安全性），
 * salt 是 PBKDF2 的（盐固定 = 同一密码永远派生出同一把密钥）。
 *
 * 两者都会写进 payload，所以随机不影响解密：解密时用的就是
 * 加密时那一份，同一密码重建多少次都还能解开。
 */
export async function encryptProtectedContent(
	content: string,
	password: string,
	scope: string,
	contentType: ProtectedContentType = "text/html",
): Promise<ProtectedPayload> {
	const salt = randomBytes(SALT_BYTES);
	const iv = randomBytes(IV_BYTES);
	const key = await deriveKey(password, salt, PROTECTED_ITERATIONS);

	const ciphertext = await requireSubtle().encrypt(
		{
			name: "AES-GCM",
			iv,
			additionalData: buildAdditionalData(scope, PROTECTED_CONTENT_VERSION),
			tagLength: TAG_BITS,
		},
		key,
		encodeUtf8(content),
	);

	return {
		v: PROTECTED_CONTENT_VERSION,
		alg: "AES-GCM",
		kdf: "PBKDF2",
		hash: "SHA-256",
		iterations: PROTECTED_ITERATIONS,
		salt: toBase64Url(salt),
		iv: toBase64Url(iv),
		ciphertext: toBase64Url(new Uint8Array(ciphertext)),
		contentType,
		scope,
	};
}

/**
 * 浏览器端调用：用密码解锁，返回明文和派生出的裸密钥
 * （裸密钥交给 protected-session 缓存，省掉下次的 PBKDF2）。
 *
 * 密码对不对不靠「比对一个哈希」，而是靠 AES-GCM 的认证标签：
 * 密码错了 → 派生出的密钥就错 → 标签校验失败 → 抛错。
 * 这样页面里存的东西不含任何密码相关的可比较信息。
 */
export async function unlockWithPassword(
	payload: ProtectedPayload,
	password: string,
): Promise<{ content: string; rawKey: string }> {
	const parsed = parseProtectedPayload(payload);
	const salt = fromBase64Url(parsed.salt);
	const iv = fromBase64Url(parsed.iv);
	const ciphertext = fromBase64Url(parsed.ciphertext);

	if (salt.length !== SALT_BYTES)
		throw new ProtectedContentError("invalid-payload");
	if (iv.length !== IV_BYTES)
		throw new ProtectedContentError("invalid-payload");
	if (ciphertext.length < TAG_BITS / 8)
		throw new ProtectedContentError("invalid-payload");

	const key = await deriveKey(password, salt, parsed.iterations);

	return {
		content: await decryptWithKey(key, parsed, iv, ciphertext),
		rawKey: await exportRawKey(key),
	};
}

/** 浏览器端调用：用缓存好的裸密钥解锁，跳过 PBKDF2 */
export async function unlockWithRawKey(
	payload: ProtectedPayload,
	rawKey: string,
): Promise<string> {
	const parsed = parseProtectedPayload(payload);
	const key = await importRawKey(rawKey);
	return decryptWithKey(
		key,
		parsed,
		fromBase64Url(parsed.iv),
		fromBase64Url(parsed.ciphertext),
	);
}

async function decryptWithKey(
	key: CryptoKey,
	payload: ProtectedPayload,
	iv: Bytes,
	ciphertext: Bytes,
): Promise<string> {
	let plaintext: ArrayBuffer;
	try {
		plaintext = await requireSubtle().decrypt(
			{
				name: "AES-GCM",
				iv,
				additionalData: buildAdditionalData(payload.scope, payload.v),
				tagLength: TAG_BITS,
			},
			key,
			ciphertext,
		);
	} catch {
		// 密码错、密文被改过、AAD 对不上，在 GCM 里都是同一个失败信号。
		// 一律当作密码错误处理 —— 顺便也不给攻击者任何区分线索。
		throw new ProtectedContentError("wrong-password");
	}
	return decoder.decode(plaintext);
}

/* ------------------------------------------------------------------ *
 * 给「构建期」用的判断：这篇文章要不要上锁
 * ------------------------------------------------------------------ */

export interface PostLockData {
	encrypted?: boolean;
	/** 允许 number：YAML 里不写引号的 `password: 123456` 会被解析成数字 */
	password?: string | number;
}

/**
 * 判断一篇文章是否加密，顺便把「写错了」的情况在构建时就拦下来。
 *
 * 约定：
 *  - 填了非空 password → 加密。这是真正的开关。
 *  - encrypted: true 但没填 password → 直接构建报错。
 *    宁可构建失败，也不要静默地把一篇本该加密的文章当明文发出去。
 */
export function isLockedPost(data: PostLockData, postId?: string): boolean {
	const hasPassword =
		data.password !== undefined && String(data.password).trim().length > 0;
	if (data.encrypted && !hasPassword) {
		const where = postId ? `文章 "${postId}"` : "有文章";
		throw new Error(
			`${where}标记了 encrypted: true 但没有填 password —— 请补上密码，或去掉 encrypted 字段。`,
		);
	}
	return hasPassword;
}
