<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';
	import { slide } from 'svelte/transition';
	
	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import ArrowCollapseUpIcon from '@iconify-svelte/mdi/arrow-collapse-up';
	import ArrowCollapseDownIcon from '@iconify-svelte/mdi/arrow-collapse-down';
	import ArrowUpIcon from '@iconify-svelte/mdi/arrow-up';
	import ArrowDownIcon from '@iconify-svelte/mdi/arrow-down';
	import ArrowRightIcon from '@iconify-svelte/mdi/arrow-right';

	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import { colors } from '$lib/colors';
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import DashboardGraph from '$lib/components/graphs/DashboardGraph.svelte';

	function generateData() {
		let rolling = 50;
		let velocity = 0;

		return d3.range(100).map((d) => {
			// Small acceleration nudge
			velocity += (Math.random() - 0.5) * 0.2;
			velocity *= 0.95; // Friction to keep momentum under control
			rolling += velocity;

			return { x: d, y: rolling };
		});
	}

	function chartHeight(width: number) {
		return Math.max(140, Math.min(180, width * 0.22));
	}
	
	let expandedChart = $state<string | null>(null);
	let hoverTimer: ReturnType<typeof setTimeout>;
	function handleMouseEnter(chartId: string) {
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			expandedChart = chartId;
		}, 10);
	}
	function handleMouseLeave() {
		clearTimeout(hoverTimer);
		expandedChart = null; // Collapses the chart when mouse leaves
	}

	function getMinMax(data: { x: number; y: number }[]) {
		const min = d3.min(data, (d) => d.y) ?? 0;
		const max = d3.max(data, (d) => d.y) ?? 0;
		return { min, max };
	}

	function getTrend(data: { x: number; y: number }[]) {
		if (data.length < 2) return 'stable';

		const recent = data[data.length - 1].y;
		const previous = data[data.length - 6]?.y ?? data[data.length - 2].y;
		const difference = recent - previous;

		if (difference > 0.5) return 'rising';
		if (difference < -0.5) return 'falling';

		return 'stable';
	}

	function trendLabel(trend: string) {
		if (trend === 'rising') return 'Rising';
		if (trend === 'falling') return 'Falling';
		return 'Stable';
	}

	function getRate(data: { x: number; y: number }[]) {
		if (data.length < 2) return 0;
		const current = data[data.length - 1].y;
		const previous = data[data.length - 2].y;
		return current - previous;
	}

	const humidity = generateData();
	const temperature = generateData();
	const tvoc = generateData();
	const weight = generateData();

	const experimentId = 'DEMO-001';
	const experimentStatus = 'Monitoring';
	const startedAt = 'October 6, 2026 – 9:00 AM';
	const elapsedTime = '2 hours 35 minutes';
	const initialMass = 46;
	const currentMass = Math.round(weight[weight.length - 1].y * 10) / 10;
	const massGain = Math.round((currentMass - initialMass) * 10) / 10;
	const adsorptionRate = Math.max(0, Math.round(getRate(weight) * 1000) / 1000);
	const rhThreshold = 75;
	const currentHumidity = Math.round(humidity[humidity.length - 1].y);
	const estimatedProtectionTime = Math.max(
		0,
		Math.round((rhThreshold - currentHumidity) * 1.8 * 10) / 10
	);
	const rhTrend = getRate(humidity) > 0.05 ? 'Increasing' : 'Stable';
	const scgCondition = massGain > 0.5 ? 'Actively Adsorbing' : 'Monitoring';
	const recommendation =
		currentHumidity >= rhThreshold
			? 'Inspect or replace the desiccant.'
			: 'Continue monitoring the experiment.';

	const recentReadings = [
		{ time: '9:35 AM', humidity: 50, temperature: 29, tvoc: 62, mass: currentMass },
		{
			time: '9:30 AM',
			humidity: 51,
			temperature: 29,
			tvoc: 60,
			mass: Math.max(0, currentMass - 0.1)
		},
		{
			time: '9:25 AM',
			humidity: 50,
			temperature: 28,
			tvoc: 59,
			mass: Math.max(0, currentMass - 0.2)
		}
	];
</script>

<div class="flex min-w-0 flex-col gap-4">
	<PageHeader pageTitle="Home">
		<BaseButton palette="caramel" onclick={() => {}}>
			<CloudRefreshIcon class="h-6" />
			Refetch Sensor Data
		</BaseButton>
	</PageHeader>


	<DashboardGraph data={humidity} label="Humidity" unit="%" theme="navy"/>
	<DashboardGraph data={temperature} label="Temperature" unit="°C" theme="berry"/>
	<DashboardGraph data={tvoc} label="Total Volatile Organic Compounds" unit=" µg/m³" theme="matcha" />
	<DashboardGraph data={weight} label="Spent Coffee Grounds Weight" unit=" g" theme="caramel"/>

	<hr class="my-2 border-t-2 border-solid border-almond" />

	<!-- Experiment status -->
	<section class="rounded-lg border border-milk/20 bg-espresso/60 p-4 text-milk">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold">Current Experiment</h2>
			<span class="rounded-full bg-matcha px-3 py-1 text-sm font-semibold text-espresso"
				>● {experimentStatus}</span
			>
		</div>
		<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
			<div>
				<p class="text-milk/60">Experiment ID</p>
				<p class="font-semibold">{experimentId}</p>
			</div>
			<div>
				<p class="text-milk/60">Started</p>
				<p class="font-semibold">{startedAt}</p>
			</div>
			<div>
				<p class="text-milk/60">Elapsed Time</p>
				<p class="font-semibold">{elapsedTime}</p>
			</div>
			<div>
				<p class="text-milk/60">Last Updated</p>
				<p class="font-semibold">9:35 AM</p>
			</div>
			<div>
				<p class="text-milk/60">Sensor Status</p>
				<p class="font-semibold text-matcha">● Connected</p>
			</div>
		</div>
	</section>

	<!-- Performance and decision support -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<section class="rounded-lg border-2 border-caramel bg-caramel/15 p-4 text-milk">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">SCG Performance Summary</h2>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div>
					<p class="text-sm text-milk/60">Initial Mass</p>
					<p class="text-xl font-bold">{initialMass} g</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Current Mass</p>
					<p class="text-xl font-bold">{currentMass} g</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Mass Gain</p>
					<p class="text-xl font-bold">{massGain} g</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Adsorption Rate</p>
					<p class="text-xl font-bold">{adsorptionRate} g/min</p>
				</div>
			</div>
			<div class="mt-4 rounded-md bg-espresso/70 p-3">
				<p class="text-sm text-milk/60">Estimated SCG Condition</p>
				<p class="text-lg font-semibold text-caramel">{scgCondition}</p>
			</div>
		</section>

		<section class="rounded-lg border-2 border-navy bg-navy/15 p-4 text-milk">
			<h2 class="mb-4 text-2xl font-semibold text-navy">Prediction and Decision Support</h2>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-milk/60">RH Threshold</p>
					<p class="text-xl font-bold">{rhThreshold}%</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">RH Trend</p>
					<p class="text-xl font-bold">{rhTrend}</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Estimated Protection Time</p>
					<p class="text-xl font-bold">{estimatedProtectionTime} hrs</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Model Status</p>
					<p class="text-xl font-bold text-matcha">Prototype</p>
				</div>
			</div>
			<div class="mt-4 rounded-md bg-navy/40 p-3">
				<p class="text-sm text-milk/60">Recommendation</p>
				<p class="font-semibold">{recommendation}</p>
			</div>
		</section>
	</div>

	<!-- Alerts -->
	<section class="rounded-lg border border-milk/20 bg-espresso/50 p-4 text-milk">
		<h2 class="mb-3 text-2xl font-semibold">Alerts and Notifications</h2>
		<div class="space-y-2 text-sm">
			<p class="rounded-md bg-matcha/20 p-2 text-matcha">● All sensors are operating normally.</p>
			<p class="rounded-md bg-navy/20 p-2 text-navy">
				● Relative humidity is {rhTrend.toLowerCase()}.
			</p>
			<p class="rounded-md bg-caramel/20 p-2 text-caramel">● SCG mass gain is being monitored.</p>
		</div>
	</section>

	<!-- Recent readings -->
	<section class="rounded-lg border border-milk/20 bg-espresso/50 p-4 text-milk">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold">Recent Sensor Readings</h2>
			<BaseButton palette="navy" onclick={() => {}}>View Full Report</BaseButton>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full min-w-[620px] text-left text-sm">
				<thead class="border-b border-milk/20 text-milk/60">
					<tr
						><th class="p-2">Time</th><th class="p-2">RH</th><th class="p-2">Temperature</th><th
							class="p-2">eTVOC</th
						><th class="p-2">Mass</th></tr
					>
				</thead>
				<tbody>
					{#each recentReadings as reading (reading.time)}
						<tr class="border-b border-milk/10"
							><td class="p-2">{reading.time}</td><td class="p-2">{reading.humidity}%</td><td
								class="p-2">{reading.temperature} °C</td
							><td class="p-2">{reading.tvoc}</td><td class="p-2">{reading.mass.toFixed(1)} g</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- <div class="hidden flex-col gap-4">
		<h1 class="mb-6 text-4xl font-bold text-ground">Color Tests</h1>

		<h2 class="mb-6 text-2xl font-bold text-ground">Accent Colors</h2>
		<div class="mb-4 flex flex-wrap gap-4">
			<BaseButton palette="berry">Berry</BaseButton>
			<BaseButton palette="spice">Spice</BaseButton>
			<BaseButton palette="caramel">Caramel</BaseButton>
			<BaseButton palette="matcha">Matcha</BaseButton>
			<BaseButton palette="navy">Navy</BaseButton>
			<BaseButton palette="lavender">Lavender</BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Dark Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="ground">Ground</BaseButton>
			<BaseButton palette="espresso">Espresso</BaseButton>
			<BaseButton palette="hazelnut">Hazelnut</BaseButton>
			<BaseButton palette="mocha">Mocha</BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Light Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="almond">Almond</BaseButton>
			<BaseButton palette="oat">Oat</BaseButton>
			<BaseButton palette="cream">Cream</BaseButton>
			<BaseButton palette="milk">Milk</BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Neutral Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="slate">Slate</BaseButton>
		</div>
		</div> -->
</div>
