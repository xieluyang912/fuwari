/**
 * 日历的纯函数工具集（移植自 Mizuki 的 calendarUtils / useCalendar）。
 * 全部写成无副作用的函数，方便在 Svelte 组件里用 $derived 直接算。
 */
import type { CalendarDataIndexes, CalendarPost } from "./types";

/**
 * 这个月 1 号是星期几。
 * JS 的 getDay() 里 0 是周日，这里换算成「0 是周一」，
 * 这样配合「一二三四五六日」的表头就不用额外处理了。
 */
export function getFirstDayOfMonth(year: number, month: number): number {
	return (new Date(year, month, 1).getDay() + 6) % 7;
}

/** 这个月有多少天。new Date(y, m+1, 0) 会自动回退到上个月最后一天 */
export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/** 把年月日拼成 "2024-05-01" 这样的键 */
export function formatDateKey(
	year: number,
	month: number,
	day: number,
): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 月份索引的键，注意 month 从 0 开始 */
export function formatMonthKey(year: number, month: number): string {
	return `${year}-${month}`;
}

/**
 * 把文章数组加工成三份索引：
 * - 按天索引：点某一天时直接取
 * - 按月索引：没选具体日期时显示当月全部文章
 * - 统计信息：给月/年选择器标点用
 *
 * 这里顺手按日期倒序排一下，保证列表里新的在上面。
 */
export function processPostsData(posts: CalendarPost[]): CalendarDataIndexes {
	const postDateMap: Record<string, CalendarPost[]> = {};
	const postsByMonth: Record<string, CalendarPost[]> = {};
	const stats = {
		hasPostInYear: {} as Record<string, boolean>,
		hasPostInMonth: {} as Record<string, boolean>,
		minYear: new Date().getFullYear(),
		maxYear: new Date().getFullYear(),
	};

	if (!posts || posts.length === 0) {
		return { postDateMap, postsByMonth, stats };
	}

	for (const post of posts) {
		const [yStr, mStr] = post.date.split("-");
		const year = Number.parseInt(yStr, 10);
		const month = Number.parseInt(mStr, 10);

		stats.hasPostInYear[year] = true;
		// 注意：这里用「人读的月份」（1-12）作键，和月选择器里的索引 +1 对应
		stats.hasPostInMonth[`${year}-${month}`] = true;

		if (year < stats.minYear) stats.minYear = year;
		if (year > stats.maxYear) stats.maxYear = year;

		// 按天索引
		if (!postDateMap[post.date]) postDateMap[post.date] = [];
		postDateMap[post.date].push(post);

		// 程序里用的月份索引从 0 开始，所以这里要减 1
		const monthKey = `${year}-${month - 1}`;
		if (!postsByMonth[monthKey]) postsByMonth[monthKey] = [];
		postsByMonth[monthKey].push(post);
	}

	// 按日期倒序，新的排前面
	const byDateDesc = (a: CalendarPost, b: CalendarPost) =>
		a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
	for (const key of Object.keys(postDateMap)) postDateMap[key].sort(byDateDesc);
	for (const key of Object.keys(postsByMonth))
		postsByMonth[key].sort(byDateDesc);

	return { postDateMap, postsByMonth, stats };
}
