/**
 * 加密文章的数据契约。
 *
 * 这个类型同时被「构建时的加密」和「浏览器里的解密」使用：
 * 构建时把文章正文加密成下面这个 payload，塞进页面的
 * <script type="application/json"> 里；访客输入正确密码后，
 * 浏览器再按同样的格式把它解回来。
 *
 * 因为 payload 会原样出现在公开的 HTML 里，所以它只允许包含
 * 密文和算法参数 —— 绝不能加入任何能反推出正文或密码的字段。
 */

/** 数据格式版本。日后若要改加密参数，把它 +1 即可让旧页面直接失效而不是解出乱码 */
export const PROTECTED_CONTENT_VERSION = 1 as const;

/** 解出来是什么。目前只有 HTML（文章正文），加密相册之类的可以复用同一套 */
export type ProtectedContentType = "text/html";

export interface ProtectedPayload {
	/** 格式版本，见 PROTECTED_CONTENT_VERSION */
	v: typeof PROTECTED_CONTENT_VERSION;
	/** 对称加密算法 */
	alg: "AES-GCM";
	/** 口令派生算法 */
	kdf: "PBKDF2";
	/** 派生时用的摘要 */
	hash: "SHA-256";
	/** PBKDF2 迭代次数。写进 payload 是为了让旧页面在默认值上调后仍能解开 */
	iterations: number;
	/** 每次加密都重新随机生成的盐，base64url */
	salt: string;
	/** 每次加密都重新随机生成的初始向量，base64url */
	iv: string;
	/** 密文（含 GCM 认证标签），base64url */
	ciphertext: string;
	/** 解密后应得到的内容类型 */
	contentType: ProtectedContentType;
	/** 作用域，形如 post:<文章 id>，见 utils/password-protection.ts 里的 AAD 说明 */
	scope: string;
}

/**
 * 校验从页面里读出来的 payload 是否可信。
 *
 * 浏览器端拿到的是页面里的一段 JSON，理论上可以被访客自己改。
 * 这里把所有算法参数都钉死成硬编码的期望值，避免有人拿一个
 * 迭代次数为 1、或者换了别的算法的 payload 来诱导我们做奇怪的事。
 */
export function parseProtectedPayload(raw: unknown): ProtectedPayload {
	if (typeof raw !== "object" || raw === null) {
		throw new TypeError("payload is not an object");
	}
	const p = raw as Record<string, unknown>;

	if (p.v !== PROTECTED_CONTENT_VERSION) throw new TypeError("bad version");
	if (p.alg !== "AES-GCM") throw new TypeError("bad alg");
	if (p.kdf !== "PBKDF2") throw new TypeError("bad kdf");
	if (p.hash !== "SHA-256") throw new TypeError("bad hash");
	if (p.contentType !== "text/html") throw new TypeError("bad contentType");
	if (typeof p.scope !== "string" || p.scope.length === 0)
		throw new TypeError("bad scope");

	if (
		typeof p.iterations !== "number" ||
		!Number.isInteger(p.iterations) ||
		p.iterations < 1000 ||
		p.iterations > 5_000_000
	) {
		throw new TypeError("bad iterations");
	}

	for (const field of ["salt", "iv", "ciphertext"] as const) {
		if (typeof p[field] !== "string" || p[field].length === 0) {
			throw new TypeError(`bad ${field}`);
		}
	}

	return p as unknown as ProtectedPayload;
}

/** payload 的身份标识：只由「不会随每次构建变化」的字段组成 */
export function getPayloadId(payload: ProtectedPayload): string {
	return [payload.v, payload.scope, payload.contentType].join(":");
}
