<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import { slide } from 'svelte/transition';

	import ArrowCollapseUpIcon from '@iconify-svelte/mdi/arrow-collapse-up';
	import ArrowCollapseDownIcon from '@iconify-svelte/mdi/arrow-collapse-down';
	import ArrowUpIcon from '@iconify-svelte/mdi/arrow-up';
	import ArrowDownIcon from '@iconify-svelte/mdi/arrow-down';
	import ArrowRightIcon from '@iconify-svelte/mdi/arrow-right';

	import { colors } from '$lib/colors';

	const variantClasses = {
		berry: {
			body: 'bg-berry/50 border-berry',
			info: 'bg-berry',
			line: colors.berry
		},
		caramel: {
		body: 'bg-caramel/50 border-caramel',
			info: 'bg-caramel',
			line: colors.caramel
		},
		matcha: {
		body: 'bg-matcha/50 border-matcha',
			info: 'bg-matcha',
			line: colors.matcha
		},
		navy: {
		body: 'bg-navy/50 border-navy',
			info: 'bg-navy',
			line: colors.navy
		},
	};

	type Trend = 'Rising' | 'Falling' | 'Stable';

	const {
		data,
		label,
		unit,
		theme
	}: {
		data: { x: number; y: number }[];
		label: string;
		unit: string;
		theme: keyof typeof variantClasses
	} = $props();

	let isExpanded = $state(false);
	let hoverTimer: NodeJS.Timeout;

	function handleMouseEnter() {
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			isExpanded = true;
		}, 10);
	}

	function handleMouseLeave() {
		clearTimeout(hoverTimer);
		isExpanded = false;
	}

	function getTrend(data: { x: number; y: number }[]): Trend {
		if (data.length < 2) return 'Stable';

		const recent = data[data.length - 1].y;
		const previous = data[data.length - 6]?.y ?? data[data.length - 2].y;
		const difference = recent - previous;

		if (difference > 0.5) return 'Rising';
		if (difference < -0.5) return 'Falling';

		return 'Stable';
	}

	function chartHeight(width: number) {
		return Math.max(140, Math.min(180, width * 0.22));
	}

	const themeColors = $derived(variantClasses[theme]);

	const dataValues = $derived(data.map((point) => point.y));
	const dataMin = $derived(Math.min(...dataValues));
	const dataMax = $derived(Math.max(...dataValues));
	const dataFinalPoint = $derived(dataValues[dataValues.length - 1]);
	const dataTrend = $derived(getTrend(data));
</script>

<div
	class={`min-w-0 rounded-md border-2 p-2 ${themeColors.body}`}
	role="group"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="flex flex-row justify-between">
		<h2 class="text-2xl font-semibold text-oat">{label}</h2>

		<div class={`flex flex-row justify-between gap-2 rounded-md p-1 px-2 text-milk ${themeColors.info}`}>
			<div class="flex flex-col justify-between text-xs">
				<div>
					<ArrowCollapseUpIcon class="inline-block h-3" /> Max:
					{Math.round(dataMax)}{unit}
				</div>
				<div>
					<ArrowCollapseDownIcon class="inline-block h-3" /> Min:
					{Math.round(dataMin)}{unit}
				</div>
			</div>
			<div
				class="flex items-center gap-1 text-sm font-semibold
	                    {dataTrend === 'Rising'
					? 'text-berry'
					: dataTrend === 'Falling'
						? 'text-matcha'
						: 'text-milk/70'}"
			>
				{#if dataTrend === 'Rising'}
					<ArrowUpIcon class="h-5" />
				{:else if dataTrend === 'Falling'}
					<ArrowDownIcon class="h-5" />
				{:else}
					<ArrowRightIcon class="h-5" />
				{/if}

				{dataTrend}
			</div>

			<h2 class="self-center text-xl font-semibold">
				{Math.round(dataFinalPoint)}{unit}
			</h2>
		</div>
	</div>

	{#if isExpanded}
		<hr class={`my-2 border-t-2 ${themeColors.body}`} />
		<div transition:slide={{ duration: 300 }} class="flex flex-col overflow-hidden">
			<Plot height={chartHeight}>
				<Line x="x" y="y" {data} stroke={colors.almond} strokeWidth={4} />
			</Plot>
		</div>
	{/if}
</div>
