/**
 * 日历小部件的类型定义（移植自 Mizuki 的 calendar/types）。
 */

/** 日历里用到的一篇文章的精简信息（由 /api/calendar-data.json 提供） */
export interface CalendarPost {
	/** 文章 slug，同时用作列表的 key */
	id: string;
	/** 文章标题 */
	title: string;
	/** 发布日期，格式 YYYY-MM-DD */
	date: string;
	/** 文章完整链接（已经在服务端拼好 base path，前端直接跳） */
	url: string;
}

/** 用来给「月选择器 / 年选择器」标点的统计信息 */
export interface CalendarStats {
	/** 某年是否有文章，键是年份 */
	hasPostInYear: Record<string, boolean>;
	/** 某月是否有文章，键是 `${年}-${月}`（月是 1-12，和月选择器下标 +1 对应） */
	hasPostInMonth: Record<string, boolean>;
	/** 最早有文章的年份 */
	minYear: number;
	/** 最晚有文章的年份 */
	maxYear: number;
}

/** 日历网格里的一个格子 */
export interface CalendarGridCell {
	/** 几号 */
	day: number;
	/** 形如 "2024-05-01" */
	dateKey: string;
	/** 这一天的文章 */
	posts: CalendarPost[];
	/** 这一天有没有文章 */
	hasPost: boolean;
	/** 这一天的文章数 */
	postCount: number;
	/** 是不是今天 */
	isToday: boolean;
	/** 是不是当前选中的那天 */
	isSelected: boolean;
	/** 占位空格（用于对齐星期，永远为 false，留字段是为了兼容） */
	isEmpty: boolean;
}

/** 对文章数组做完索引之后的结果 */
export interface CalendarDataIndexes {
	/** `${YYYY-MM-DD}` → 当天的文章列表 */
	postDateMap: Record<string, CalendarPost[]>;
	/** `${年}-${月}`（月从 0 开始） → 当月的文章列表 */
	postsByMonth: Record<string, CalendarPost[]>;
	stats: CalendarStats;
}

/** 当前日历处于哪一层视图 */
export type CalendarView = "day" | "month" | "year";
