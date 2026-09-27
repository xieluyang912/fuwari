<script lang="ts">
/**
 * 年份选择器：点月份选择器的标题后盖上来的那一层。
 * 只列出「最早有文章」到「今年」之间的年份，避免出现一大堆空年份。
 */
import Icon from "@iconify/svelte";
import type { CalendarStats } from "./types";

interface Props {
	currentYear: number;
	stats: CalendarStats;
	onYearSelect: (year: number) => void;
}

const { currentYear, stats, onYearSelect }: Props = $props();

/**
 * 生成年份区间：从最早有文章的年份开始，到「今年」和「最晚有文章的年份」里更晚的那个。
 * 至少保证包含当前选中的年份。
 */
const years = $derived.by(() => {
	const thisYear = new Date().getFullYear();
	const maxYear = Math.max(thisYear, stats.maxYear, currentYear);
	const minYear = Math.min(stats.minYear, currentYear);
	const list: number[] = [];
	for (let y = maxYear; y >= minYear; y--) list.push(y);
	return list;
});
</script>

<div class="w-full h-full p-2 overflow-y-auto hide-scrollbar">
	<div class="grid grid-cols-3 gap-2">
		{#each years as year (year)}
			<!-- 和月选择器一样：没文章的年份压暗一档，有文章的保持深色加粗 -->
			<button
				type="button"
				class="rounded-lg py-3 flex flex-col items-center justify-center transition-all
				       hover:bg-[var(--btn-plain-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-2
				       focus-visible:outline-[var(--primary)]
				       {year === currentYear
					? 'text-[var(--primary)] font-bold bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
					: stats.hasPostInYear[year]
						? 'text-neutral-700 dark:text-neutral-300 font-bold'
						: 'text-neutral-400 dark:text-neutral-500 font-medium hover:text-neutral-600 dark:hover:text-neutral-300'}"
				onclick={() => onYearSelect(year)}
				aria-current={year === currentYear ? "true" : undefined}
			>
				<span class="text-sm">{year}</span>
				{#if stats.hasPostInYear[year]}
					<span class="w-1 h-1 rounded-full bg-[var(--primary)] mt-1" aria-hidden="true"
					></span>
				{:else}
					<span class="w-1 h-1 mt-1" aria-hidden="true"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- 往回翻的提示：如果想看更早的年份，得先在配置里加上更早的文章 -->
	{#if years.length === 0}
		<div class="flex flex-col items-center justify-center h-full text-neutral-400 text-sm gap-2">
			<Icon icon="material-symbols:event-busy-outline" class="text-2xl" />
			<span>—</span>
		</div>
	{/if}
</div>
