<script lang="ts">
/**
 * 日历网格：上面一行星期表头，下面 7 列的日期格子。
 * 有文章的日子右下角会有一个小圆点（多篇时右上角还会显示数量）。
 */
import type { CalendarGridCell } from "./types";

interface Props {
	/** 星期表头，7 个，从周一开始 */
	weekDays: string[];
	/** 这个月 1 号之前要空出几个格子（用来对齐星期） */
	emptyCellsCount: number;
	/** 这个月所有日期格子 */
	cells: CalendarGridCell[];
	/** 点击某一天的回调 */
	onCellClick: (dateKey: string) => void;
	/** 键盘操作（←/→ 翻月，Home 回今天），由上层处理 */
	onCellKeydown: (event: KeyboardEvent) => void;
}

const { weekDays, emptyCellsCount, cells, onCellClick, onCellKeydown }: Props =
	$props();

/** 根据格子状态拼出不同的配色 */
function getCellClass(cell: CalendarGridCell): string {
	const base =
		"calendar-day aspect-square flex items-center justify-center rounded-md cursor-pointer relative transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

	// 选中 > 今天 > 有文章 > 没文章
	if (cell.isSelected) {
		return `${base} bg-[var(--primary)] text-white shadow-md`;
	}
	if (cell.isToday) {
		return `${base} text-[var(--primary)] font-bold bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]`;
	}
	if (cell.hasPost) {
		return `${base} font-bold text-neutral-900 dark:text-neutral-100 hover:bg-[var(--btn-plain-bg-hover)]`;
	}
	// 没文章的日子压暗一档、不加粗：一屏里哪些日子有东西一眼就能看出来
	return `${base} text-neutral-400 dark:text-neutral-500 hover:bg-[var(--btn-plain-bg-hover)] hover:text-neutral-600 dark:hover:text-neutral-300`;
}
</script>

<div class="grid grid-cols-7 gap-1 mb-2">
	{#each weekDays as day (day)}
		<div class="text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium py-1 transition">
			{day}
		</div>
	{/each}
</div>
<div class="grid grid-cols-7 gap-1">
	<!-- 月初的占位空格 -->
	{#each Array(emptyCellsCount) as _, i (i)}
		<div class="aspect-square"></div>
	{/each}

	{#each cells as cell (cell.dateKey)}
		<button
			type="button"
			class={getCellClass(cell)}
			data-date={cell.dateKey}
			data-day={cell.day}
			aria-label={cell.dateKey}
			aria-current={cell.isToday ? "date" : undefined}
			aria-pressed={cell.isSelected}
			onclick={() => onCellClick(cell.dateKey)}
			onkeydown={onCellKeydown}
		>
			{cell.day}
			<!-- 有文章的小圆点。选中状态下底色是主题色，圆点会看不见，所以不画 -->
			{#if cell.hasPost && !cell.isSelected}
				<span class="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--primary)]"></span>
			{/if}
			<!-- 一天有不止一篇文章时，右上角标个数字 -->
			{#if cell.hasPost && cell.postCount > 1 && !cell.isSelected}
				<span class="absolute top-0.5 right-0.5 text-[9px] opacity-70 scale-75">{cell.postCount}</span>
			{/if}
		</button>
	{/each}
</div>
