import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { es } from "./languages/es";
import { id } from "./languages/id";
import { ja } from "./languages/ja";
import { ko } from "./languages/ko";
import { th } from "./languages/th";
import { tr } from "./languages/tr";
import { vi } from "./languages/vi";
import { zh_CN } from "./languages/zh_CN";
import { zh_TW } from "./languages/zh_TW";

export type Translation = {
	[K in I18nKey]: string;
};

/**
 * 语言文件可以只写一部分键，缺的部分由英文兜底。
 *
 * 这么设计是因为后面陆续加了看板娘、日历等一堆功能，
 * 文案键一下子多了几十个。如果强制每个语言文件都写全，
 * 以后每加一个功能就要改 10 个文件，很容易漏。
 */
export type PartialTranslation = Partial<Translation>;

const defaultTranslation = en;

/** 用英文补全某个语言里缺失的键 */
function withFallback(partial: PartialTranslation): Translation {
	return { ...defaultTranslation, ...partial };
}

const map: { [key: string]: PartialTranslation } = {
	es: es,
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
	zh_cn: zh_CN,
	zh_tw: zh_TW,
	ja: ja,
	ja_jp: ja,
	ko: ko,
	ko_kr: ko,
	th: th,
	th_th: th,
	vi: vi,
	vi_vn: vi,
	id: id,
	tr: tr,
	tr_tr: tr,
};

export function getTranslation(lang: string): Translation {
	const partial = map[lang.toLowerCase()];
	return partial ? withFallback(partial) : defaultTranslation;
}

export function i18n(key: I18nKey): string {
	const lang = siteConfig.lang || "en";
	return getTranslation(lang)[key];
}
