<script lang="ts">
/**
 * 日历小部件主体（移植自 Mizuki 的 Calendar.svelte）。
 *
 * 三层视图，点标题逐层往上级：
 *   day（日期网格） → month（12 个月） → year（年份列表）
 * 点日期格子会筛选出当天的文章；再点一次取消选中，回到当月文章列表。
 *
 * 文章数据是挂载后从 /api/calendar-data.json 拉的，
 * 这样切月份不用重新请求，也不会把文章列表塞进每个页面的 HTML 里。
 */
import Icon from "@iconify/svelte";
import { onMount, tick } from "svelte";
import CalendarGrid from "./CalendarGrid.svelte";
import {
	formatDateKey,
	formatMonthKey,
	getDaysInMonth,
	getFirstDayOfMonth,
	processPostsData,
} from "./calendar-utils";
import MonthPicker from "./MonthPicker.svelte";
import type {
	CalendarGridCell,
	CalendarPost,
	CalendarStats,
	CalendarView,
} from "./types";
import YearPicker from "./YearPicker.svelte";

interface Props {
	/** 12 个月份名，由 Astro 那边按当前语言传进来 */
	monthNames: string[];
	/** 7 个星期名，从周一开始 */
	weekDays: string[];
	/** 年份和月份之间的连接符：「年」「년 」或者一个空格 */
	yearSuffix: string;
	/** 拉取文章数据的接口地址（已含 base path） */
	apiUrl: string;
	/** 「这个月没有文章」文案 */
	noPostText: string;
	/** 「回到今天」的无障碍标签 */
	backToTodayText: string;
	/** 下面三个只给屏幕阅读器用，界面上看不到 */
	selectMonthYearText: string;
	prevMonthText: string;
	nextMonthText: string;
}

const {
	monthNames,
	weekDays,
	yearSuffix,
	apiUrl,
	noPostText,
	backToTodayText,
	selectMonthYearText,
	prevMonthText,
	nextMonthText,
}: Props = $props();

// ---------- 状态 ----------
let allPosts: CalendarPost[] = $state([]);
let postDateMap: Record<string, CalendarPost[]> = $state({});
let postsByMonth: Record<string, CalendarPost[]> = $state({});
let stats: CalendarStats = $state({
	hasPostInYear: {},
	hasPostInMonth: {},
	minYear: new Date().getFullYear(),
	maxYear: new Date().getFullYear(),
});

const today = new Date();
let todayYear = $state(today.getFullYear());
let todayMonth = $state(today.getMonth());
let todayDate = $state(today.getDate());

let currentYear = $state(today.getFullYear());
let currentMonth = $state(today.getMonth());
/** 当前选中的某一天，null 表示没选（显示当月文章） */
let selectedDateKey: string | null = $state(null);
let currentView: CalendarView = $state("day");
/** 日期网格那一块，翻月后要在这里面把焦点找回来 */
let gridAreaEl = $state<HTMLElement | null>(null);

// ---------- 派生值 ----------
/** 左上角标题：有文章的时候点它可以切到月选择器 */
const titleText = $derived(
	`${currentYear}${yearSuffix}${monthNames[currentMonth] ?? ""}`,
);

/** 不是今天、或者选中了某一天时，才显示「回到今天」按钮 */
const isBackToTodayVisible = $derived(
	currentYear !== todayYear ||
		currentMonth !== todayMonth ||
		selectedDateKey !== null,
);

/** 月初要空几格 */
const emptyCellsCount = $derived(getFirstDayOfMonth(currentYear, currentMonth));

/** 当前要显示的日期格子 */
const cells = $derived.by<CalendarGridCell[]>(() => {
	const daysInMonth = getDaysInMonth(currentYear, currentMonth);
	const result: CalendarGridCell[] = [];
	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = formatDateKey(currentYear, currentMonth, day);
		const posts = postDateMap[dateKey] ?? [];
		result.push({
			day,
			dateKey,
			posts,
			hasPost: posts.length > 0,
			postCount: posts.length,
			isToday:
				currentYear === todayYear &&
				currentMonth === todayMonth &&
				day === todayDate,
			isSelected: selectedDateKey === dateKey,
			isEmpty: false,
		});
	}
	return result;
});

/** 下方列表：选了某天就显示当天的，否则显示当月的 */
const displayedPosts = $derived(
	selectedDateKey
		? (postDateMap[selectedDateKey] ?? [])
		: (postsByMonth[formatMonthKey(currentYear, currentMonth)] ?? []),
);

// ---------- 方法 ----------
async function fetchCalendarData() {
	try {
		const res = await fetch(apiUrl);
		const data = await res.json();
		if (!Array.isArray(data)) return;

		allPosts = data;
		const processed = processPostsData(allPosts);
		postDateMap = processed.postDateMap;
		postsByMonth = processed.postsByMonth;
		stats = processed.stats;

		// 如果当前正在看某篇文章，自动把日历翻到那篇文章所在的月份
		const currentPost = findCurrentPost();
		if (currentPost) {
			const [y, m] = currentPost.date.split("-");
			currentYear = Number.parseInt(y, 10);
			currentMonth = Number.parseInt(m, 10) - 1;
		}
	} catch (error) {
		console.error("加载日历数据失败：", error);
	}
}

/** 用当前地址去匹配文章列表，找出「正在看的这篇」 */
function findCurrentPost(): CalendarPost | null {
	if (typeof window === "undefined") return null;
	const path = decodeURIComponent(window.location.pathname).replace(/\/$/, "");
	return allPosts.find((p) => path.endsWith(`/${p.id}`)) ?? null;
}

function handlePrevMonth() {
	currentMonth--;
	if (currentMonth < 0) {
		currentMonth = 11;
		currentYear--;
	}
	selectedDateKey = null;
}

function handleNextMonth() {
	currentMonth++;
	if (currentMonth > 11) {
		currentMonth = 0;
		currentYear++;
	}
	selectedDateKey = null;
}

function handleBackToToday() {
	currentYear = todayYear;
	currentMonth = todayMonth;
	selectedDateKey = null;
	currentView = "day";
}

function handleTitleClick() {
	// 逐层往上级：日期 → 月份 → 年份 → 收起
	if (currentView === "day") currentView = "month";
	else if (currentView === "month") currentView = "year";
	else currentView = "day";
}

function handleCellClick(dateKey: string) {
	// 再点一次同一天就取消选中
	selectedDateKey = selectedDateKey === dateKey ? null : dateKey;
}

/**
 * 日期格子上的键盘操作：← / → 翻月，Home 回今天。
 *
 * 挂在格子的 button 上而不是整个日历上，只有焦点已经在日历里时才生效，
 * 这样上下键滚动页面之类的浏览器默认行为不会被抢走。
 *
 * 翻月之后格子会重新渲染，焦点会掉回 body；所以更新完再把焦点还给
 * 「原来那一天的号数」（新月份没有 31 号就退到 30 号），
 * 这样可以一直按着方向键连着翻。
 */
async function handleCellKeydown(event: KeyboardEvent) {
	switch (event.key) {
		case "ArrowLeft":
			handlePrevMonth();
			break;
		case "ArrowRight":
			handleNextMonth();
			break;
		case "Home":
			handleBackToToday();
			break;
		default:
			return;
	}
	event.preventDefault();

	const day = Number((event.currentTarget as HTMLElement).dataset.day);
	await tick();
	const targetDay = Math.min(day, getDaysInMonth(currentYear, currentMonth));
	gridAreaEl
		?.querySelector<HTMLButtonElement>(
			`[data-date="${formatDateKey(currentYear, currentMonth, targetDay)}"]`,
		)
		?.focus();
}

function handleMonthSelect(month: number) {
	currentMonth = month;
	selectedDateKey = null;
	currentView = "day";
}

function handleYearSelect(year: number) {
	currentYear = year;
	// 选完年份顺势让用户挑月份
	currentView = "month";
}

onMount(() => {
	fetchCalendarData();

	// 页面长时间开着跨过午夜时，把「今天」的高亮挪到新的一天
	const timer = setInterval(() => {
		const now = new Date();
		if (
			now.getFullYear() !== todayYear ||
			now.getMonth() !== todayMonth ||
			now.getDate() !== todayDate
		) {
			todayYear = now.getFullYear();
			todayMonth = now.getMonth();
			todayDate = now.getDate();
		}
	}, 60000);

	return () => clearInterval(timer);
});
</script>

<!-- 标题栏 + 上一月/下一月 -->
<div class="flex justify-between items-center mb-2 mt-2">
	<button
		type="button"
		class="flex justify-center items-center cursor-pointer hover:bg-[var(--btn-plain-bg-hover)] px-2 py-1 rounded-lg transition-colors min-w-0
		       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
		onclick={handleTitleClick}
		aria-label={selectMonthYearText}
	>
		<!-- aria-live：翻月之后让屏幕阅读器把新的年月念一遍 -->
		<span
			class="text-base font-bold text-neutral-900 dark:text-neutral-100 select-none truncate transition"
			aria-live="polite"
		>
			{titleText}
		</span>
		<Icon
			icon="material-symbols:keyboard-arrow-down-rounded"
			class="text-lg ml-0.5 shrink-0 transition-transform {currentView === 'day' ? '' : 'rotate-180'}"
		/>
	</button>

	<div class="flex items-center gap-1 shrink-0 ml-2">
		{#if isBackToTodayVisible}
			<button
				type="button"
				class="p-1.5 rounded-md hover:bg-[var(--btn-plain-bg-hover)] text-[var(--primary)] transition-all
				       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
				onclick={handleBackToToday}
				aria-label={backToTodayText}
				title={backToTodayText}
			>
				<Icon icon="material-symbols:restart-alt-rounded" class="text-xl" />
			</button>
		{/if}
		<button
			type="button"
			class="p-1.5 rounded-md hover:bg-[var(--btn-plain-bg-hover)] text-neutral-600 dark:text-neutral-400
			       hover:text-[var(--primary)] transition-colors {currentView === 'day' ? '' : 'invisible'}"
			onclick={handlePrevMonth}
			aria-label={prevMonthText}
			title={prevMonthText}
		>
			<Icon icon="material-symbols:chevron-left-rounded" class="text-xl" />
		</button>
		<button
			type="button"
			class="p-1.5 rounded-md hover:bg-[var(--btn-plain-bg-hover)] text-neutral-600 dark:text-neutral-400
			       hover:text-[var(--primary)] transition-colors {currentView === 'day' ? '' : 'invisible'}"
			onclick={handleNextMonth}
			aria-label={nextMonthText}
			title={nextMonthText}
		>
			<Icon icon="material-symbols:chevron-right-rounded" class="text-xl" />
		</button>
	</div>
</div>

<!-- 主体：日期网格 + 文章列表，月/年选择器会盖在上面 -->
<div
	class="relative w-full overflow-hidden"
	style="min-height: 15.625rem;"
	bind:this={gridAreaEl}
>
	<div class="w-full">
		<CalendarGrid
			{weekDays}
			{emptyCellsCount}
			{cells}
			onCellClick={handleCellClick}
			onCellKeydown={handleCellKeydown}
		/>

		<div class="mt-3">
			<div
				class="h-[1px] w-full bg-neutral-200 dark:bg-neutral-700 mb-2"
				class:hidden={displayedPosts.length === 0}
			></div>

			<div class="flex flex-col gap-1 max-h-[9.375rem] overflow-y-auto calendar-scroll">
				{#if displayedPosts.length > 0}
					{#each displayedPosts as post (post.id)}
						<a
							href={post.url}
							class="flex items-center justify-between text-sm px-2 py-2 rounded-lg group border border-transparent
							       text-neutral-700 dark:text-neutral-300 hover:text-[var(--primary)]
							       hover:bg-[var(--btn-plain-bg-hover)] transition-colors"
						>
							<span class="truncate flex-1 font-bold">{post.title}</span>
							<span class="text-xs ml-2 whitespace-nowrap text-neutral-400 group-hover:text-[var(--primary)]/70 transition-colors">
								{Number.parseInt(post.date.split("-")[1], 10)}-{Number.parseInt(post.date.split("-")[2], 10)}
							</span>
						</a>
					{/each}
				{:else}
					<!-- 空状态：当月没文章，或者选中的那天没文章 -->
					<div class="flex flex-col items-center justify-center py-4 text-neutral-400 text-xs gap-1">
						<Icon icon="material-symbols:event-busy-outline" class="text-xl" />
						<span>{noPostText}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if currentView === "month"}
		<div class="absolute inset-0 bg-[var(--card-bg)] z-10 flex flex-col">
			<MonthPicker {monthNames} {currentYear} {currentMonth} {stats} onMonthSelect={handleMonthSelect} />
		</div>
	{:else if currentView === "year"}
		<div class="absolute inset-0 bg-[var(--card-bg)] z-10 flex flex-col">
			<YearPicker {currentYear} {stats} onYearSelect={handleYearSelect} />
		</div>
	{/if}
</div>

<style>
	/* 文章列表的细滚动条，默认的太粗了会撑破侧栏 */
	.calendar-scroll::-webkit-scrollbar {
		width: 4px;
	}
	.calendar-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.calendar-scroll::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 2px;
	}
	.calendar-scroll::-webkit-scrollbar-thumb:hover {
		background-color: rgba(156, 163, 175, 0.8);
	}
</style>
