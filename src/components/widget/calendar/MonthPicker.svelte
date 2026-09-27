<script lang="ts">
/**
 * 月份选择器：点日历标题后盖上来的那一层，3 列 × 4 行的 12 个月份。
 * 有文章的月份下面会标一个小圆点。
 */
import type { CalendarStats } from "./types";

interface Props {
	monthNames: string[];
	currentYear: number;
	currentMonth: number;
	stats: CalendarStats;
	onMonthSelect: (month: number) => void;
}

const { monthNames, currentYear, currentMonth, stats, onMonthSelect }: Props =
	$props();

function getMonthClass(index: number): string {
	const base =
		"cursor-pointer rounded-lg flex flex-col items-center justify-center p-2 transition-all hover:bg-[var(--btn-plain-bg-hover)] relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";
	if (index === currentMonth) {
		return `${base} text-[var(--primary)] font-bold bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]`;
	}
	// 有文章的月份保留深色加粗，没文章的压暗一档，
	// 这样 12 个格子里「哪几个月写过东西」扫一眼就能看出来
	return hasPost(index)
		? `${base} font-bold text-neutral-700 dark:text-neutral-300`
		: `${base} text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300`;
}

/** 这个月有没有文章（stats 里的键用的是 1-12 月） */
function hasPost(monthIndex: number): boolean {
	return !!stats.hasPostInMonth[`${currentYear}-${monthIndex + 1}`];
}
</script>

<div class="w-full h-full p-2 grid grid-cols-3 gap-2 content-center">
	{#each monthNames as name, index (name)}
		<button
			type="button"
			class={getMonthClass(index)}
			onclick={() => onMonthSelect(index)}
			aria-current={index === currentMonth ? "true" : undefined}
		>
			<span class="text-sm transition">{name}</span>
			<!-- 高度固定，有没有圆点都不会让格子跳动 -->
			<span
				class="w-1 h-1 rounded-full mt-1"
				class:bg-[var(--primary)]={hasPost(index)}
				aria-hidden="true"
			></span>
		</button>
	{/each}
</div>
