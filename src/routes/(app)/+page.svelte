<script lang="ts">
	import * as d3 from 'd3';

	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import ClockIcon from '@iconify-svelte/mdi/clock';
	import AlertIcon from '@iconify-svelte/mdi/alert';
	import AddIcon from '@iconify-svelte/mdi/add';
	import FileChartIcon from '@iconify-svelte/mdi/file-chart';

	import { experimentStore } from '$lib/dummyData/experimentStore';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import DashboardGraph from '$lib/components/graphs/DashboardGraph.svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const experiment = $derived($experimentStore.find((e) => e.status === 'Active'));

	function generateData(start = 50) {
		let rolling = start;
		let velocity = 0;

		return d3.range(100).map((d) => {
			// Small acceleration nudge
			velocity += (Math.random() - 0.5) * 0.2;
			velocity *= 0.95; // Friction to keep momentum under control
			rolling += velocity;

			return { x: d, y: rolling };
		});
	}

	function getRate(data: { x: number; y: number }[]) {
		if (data.length < 2) return 0;
		const current = data[data.length - 1].y;
		const previous = data[data.length - 2].y;
		return current - previous;
	}

		function elapsedSince(start: string) {
		const t = Date.parse(start);
		if (Number.isNaN(t)) return '—';
		const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
		const days = Math.floor(mins / 1440);
		const hours = Math.floor((mins % 1440) / 60);
		return days > 0 ? `${days} day${days > 1 ? 's' : ''} ${hours} hr` : `${hours} hr ${mins % 60} min`;
	}


	const humidity = generateData(50);
	const temperature = generateData(50);
	const tvoc = generateData(50);

	/* temporary reomve of harcode for testing purposes
	const experimentId = 'DEMO-001';
	const experimentStatus = 'Monitoring';
	const startedAt = 'October 6, 2026 – 9:00 AM';
	const elapsedTime = '2 hours 35 minutes';
	*/
	const initialMass = $derived(experiment?.initialMass ?? 46);
	const weight = $derived(generateData(initialMass + 0.2));
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
			const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

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

	<!--If ever there is no active experiment-->
		{#if !experiment}
				<section
			class="flex flex-col items-center gap-4 rounded-lg border border-milk/20 bg-almond p-10 text-center text-espresso"
		>
			<ClockIcon class="h-12 opacity-60" />
			<h2 class="text-2xl font-semibold">No current active experiment</h2>
			<p class="max-w-md text-sm opacity-70">
				Go to the Reports page to activate a paused experiment, or create a new experiment to start
				monitoring.
			</p>
			<div class="flex flex-wrap justify-center gap-3">
				<BaseButton palette="navy" onclick={() => goto(resolve('/(app)/reports'))}>
					<FileChartIcon class="h-6" />
					Go to Reports
				</BaseButton>
				<BaseButton palette="matcha" onclick={() => goto(resolve('/(app)/reports/new'))}>
					<AddIcon class="h-6" />
					New Experiment
				</BaseButton>
			</div>
		</section>
	
	{:else}
	<DashboardGraph data={humidity} label="Humidity" unit="%" theme="navy" />
	<DashboardGraph data={temperature} label="Temperature" unit="°C" theme="berry" />
	<DashboardGraph
		data={tvoc}
		label="Total Volatile Organic Compounds"
		unit=" µg/m³"
		theme="matcha"
	/>
	<DashboardGraph data={weight} label="Spent Coffee Grounds Weight" unit=" g" theme="caramel" />

	<hr class="my-2 border-t-2 border-solid border-almond" />

	<!-- Experiment status -->
	<section class="flex flex-col gap-4 rounded-lg border border-milk/20 bg-almond p-4 text-espresso">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="flex flex-row items-center gap-1 text-2xl font-semibold leading-none">
				<ClockIcon class="h-6" />
				Current Experiment
			</h2>
			<span class="rounded-full bg-matcha px-3 py-1 text-sm font-semibold text-milk">● Active</span>
			</div>

		<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
							<div>
					<p class="opacity-60">Experiment ID</p>
					<p class="font-semibold">
						{experiment.id}{experiment.name ? ` · ${experiment.name}` : ''}
					</p>
				</div>
				<div>
					<p class="opacity-60">Started</p>
					<p class="font-semibold">{experiment.start}</p>
				</div>
				<div>
					<p class="opacity-60">Elapsed Time</p>
					<p class="font-semibold">{elapsedSince(experiment.start)}</p>
				</div>
				<div>
					<p class="opacity-60">Last Updated</p>
					<p class="font-semibold">{lastUpdated}</p>
				</div>
				<div>
					<p class="opacity-60">Sensor Status</p>
					<p class="font-semibold text-matcha">
						● Connected{experiment.sensorNode ? ` (${experiment.sensorNode})` : ''}
					</p>
				</div>
			</div>


		<!-- Performance and decision support -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<section
				class="flex h-full flex-col rounded-lg border-2 border-mocha bg-caramel p-4 text-milk"
			>
				<h2 class="mb-4 text-2xl font-semibold">SCG Performance Summary</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<p class="text-sm opacity-60">Initial Mass</p>
						<p class="text-xl font-bold">{initialMass} g</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Current Mass</p>
						<p class="text-xl font-bold">{currentMass} g</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Mass Gain</p>
						<p class="text-xl font-bold">{massGain} g</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Adsorption Rate</p>
						<p class="text-xl font-bold">{adsorptionRate} g/min</p>
					</div>
				</div>

				<div class="mt-auto pt-4">
					<div class=" rounded-md bg-espresso p-3">
						<p class="text-sm opacity-60">Estimated SCG Condition</p>
						<p class="text-lg font-semibold">{scgCondition}</p>
					</div>
				</div>
			</section>

			<section class="flex h-full flex-col rounded-lg border-2 border-mocha bg-navy p-4 text-milk">
				<h2 class="mb-4 text-2xl font-semibold">Prediction and Decision Support</h2>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm opacity-60">RH Threshold</p>
						<p class="text-xl font-bold">{rhThreshold}%</p>
					</div>
					<div>
						<p class="text-sm opacity-60">RH Trend</p>
						<p class="text-xl font-bold">{rhTrend}</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Estimated Protection Time</p>
						<p class="text-xl font-bold">{estimatedProtectionTime} hrs</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Model Status</p>
						<p class="text-xl font-bold text-matcha">Prototype</p>
					</div>
				</div>
				<div class="mt-auto pt-4">
					<div class="rounded-md bg-espresso p-3">
						<p class="text-sm opacity-60">Recommendation</p>
						<p class="font-semibold">{recommendation}</p>
					</div>
				</div>
			</section>
		</div>
	</section>

	<!-- Alerts -->
	<section class="flex flex-col gap-4 rounded-lg border border-milk/20 bg-almond p-4 text-espresso">
		<h2 class="flex flex-row items-center gap-1 text-2xl font-semibold leading-none">
			<AlertIcon class="h-6" />
			Alerts and Notifications
		</h2>
		
		<div class="space-y-2 text-sm">
			<p class="rounded-md bg-matcha p-2 text-milk">● All sensors are operating normally</p>
			<p class="rounded-md bg-navy p-2 text-milk">
				● Relative humidity is {rhTrend.toLowerCase()}
			</p>
			<p class="rounded-md bg-caramel p-2 text-milk">● SCG mass gain is being monitored</p>
		</div>
	</section>

	<!-- Recent readings -->
	<section class="rounded-lg border border-mocha bg-almond p-4 text-espresso">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold">Recent Sensor Readings</h2>
							<BaseButton
					palette="navy"
					onclick={() => goto(resolve(`/(app)/reports/[id]`, { id: experiment.id }))}>
					View Full Report
				</BaseButton>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full min-w-155 text-left text-sm">
				<thead class="border-b border-mocha/75 text-ground">
					<tr
						><th class="p-2">Time</th><th class="p-2">RH</th><th class="p-2">Temperature</th><th
							class="p-2">eTVOC</th
						><th class="p-2">Mass</th></tr
					>
				</thead>
				<tbody>
					{#each recentReadings as reading (reading.time)}
						<tr class="border-b border-mocha/50"
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
	{/if}
	</div>

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
