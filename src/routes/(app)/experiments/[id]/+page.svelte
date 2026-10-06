<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';
	import ArrowLeftIcon from '@iconify-svelte/mdi/arrow-left';
	import PauseIcon from '@iconify-svelte/mdi/pause';
	import PlayIcon from '@iconify-svelte/mdi/play';
	import CheckCircleIcon from '@iconify-svelte/mdi/check-circle';
	import DownloadIcon from '@iconify-svelte/mdi/download';
	import AlertIcon from '@iconify-svelte/mdi/alert';

	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import { colors } from '$lib/colors';

	type ExperimentStatus = 'Active' | 'Paused' | 'Completed';

	let status = $state<ExperimentStatus>('Active');
	let activeTab = $state('Environmental');
	let pauseReason = $state('');
	let notes = $state('');

	const experiment = {
		id: 'EXP-001',
		name: 'SCG Batch 001 – Shoebox Trial',
		batch: 'SCG-001',
		enclosure: 'BOX-001',
		createdBy: 'Juan Dela Cruz',
		createdDate: 'October 6, 2026',
		startTime: 'October 6, 2026 – 9:00 AM',
		samplingInterval: 'Every 5 minutes',
		rhThreshold: 75,
		initialMass: 46
	};

	function createTrend(base: number, variation: number) {
		let value = base;
		return d3.range(40).map((x) => {
			value += (Math.random() - 0.42) * variation;
			return { x, y: value };
		});
	}

	const humidity = createTrend(50, 0.7);
	const temperature = createTrend(29, 0.35);
	const mass = createTrend(46.2, 0.08);
	const tvoc = createTrend(61, 0.8);

	const currentHumidity = Math.round(humidity.at(-1)?.y ?? 50);
	const currentTemperature = Math.round(temperature.at(-1)?.y ?? 29);
	const currentMass = Math.round((mass.at(-1)?.y ?? 46) * 10) / 10;
	const massGain = Math.round((currentMass - experiment.initialMass) * 10) / 10;
	const currentTvoc = Math.round(tvoc.at(-1)?.y ?? 61);
	const adsorptionRate = 0.015;
	const protectionTime = Math.max(0, Math.round((experiment.rhThreshold - currentHumidity) * 1.8 * 10) / 10);

	const timeline = [
		{ time: '9:00 AM', event: 'Experiment started' },
		{ time: '9:05 AM', event: 'Initial sensor reading recorded' },
		{ time: '9:30 AM', event: 'SCG mass gain detected' },
		{ time: '10:15 AM', event: `RH reached ${currentHumidity}%` },
		{ time: '11:00 AM', event: 'Adsorption rate calculated' },
		{ time: '11:35 AM', event: 'Latest sensor reading received' }
	];

	const recentReadings = [
		{ time: '11:35 AM', rh: currentHumidity, temp: currentTemperature, tvoc: currentTvoc, mass: currentMass },
		{ time: '11:30 AM', rh: 51, temp: 29, tvoc: 60, mass: currentMass - 0.1 },
		{ time: '11:25 AM', rh: 50, temp: 29, tvoc: 59, mass: currentMass - 0.2 },
		{ time: '11:20 AM', rh: 50, temp: 28, tvoc: 61, mass: currentMass - 0.3 }
	];

	function changeStatus(nextStatus: ExperimentStatus) {
		status = nextStatus;
	}

	function statusClass(currentStatus: ExperimentStatus) {
		if (currentStatus === 'Active') return 'bg-matcha text-espresso';
		if (currentStatus === 'Paused') return 'bg-caramel text-espresso';
		return 'bg-navy text-milk';
	}
</script>

<div class="min-h-screen bg-ground px-6 py-5 text-milk lg:px-10">
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<button class="mb-3 flex items-center gap-1 text-caramel hover:text-milk" onclick={() => history.back()}>
					<ArrowLeftIcon class="h-5" /> Back to Experiments
				</button>
				<h1 class="text-4xl font-bold">Experiment Details</h1>
				<p class="text-milk/70">{experiment.name} · {experiment.id}</p>
			</div>

			<div class="flex flex-wrap gap-2">
				<span class={`rounded-full px-4 py-2 text-sm font-semibold ${statusClass(status)}`}>{status}</span>
				{#if status === 'Active'}
					<BaseButton palette="caramel" onclick={() => changeStatus('Paused')}>
						<PauseIcon class="h-5" /> Pause Experiment
					</BaseButton>
					<BaseButton palette="matcha" onclick={() => changeStatus('Completed')}>
						<CheckCircleIcon class="h-5" /> Complete Experiment
					</BaseButton>
				{:else if status === 'Paused'}
					<BaseButton palette="matcha" onclick={() => changeStatus('Active')}>
						<PlayIcon class="h-5" /> Resume Experiment
					</BaseButton>
				{:else}
					<BaseButton palette="navy"><DownloadIcon class="h-5" /> Export Report</BaseButton>
				{/if}
			</div>
		</div>

		<!-- Status and configuration -->
		<section class="mb-5 rounded-lg border border-milk/30 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Status & Configuration</h2>
			<div class="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
				<div><p class="text-milk/60">Experiment ID</p><p class="text-lg font-semibold">{experiment.id}</p></div>
				<div><p class="text-milk/60">Status</p><p class="text-lg font-semibold">{status}</p></div>
				<div><p class="text-milk/60">Created By</p><p class="font-semibold">{experiment.createdBy}</p></div>
				<div><p class="text-milk/60">Created Date</p><p class="font-semibold">{experiment.createdDate}</p></div>
				<div><p class="text-milk/60">Start Time</p><p class="font-semibold">{experiment.startTime}</p></div>
				<div><p class="text-milk/60">Elapsed Time</p><p class="font-semibold">2 hours 35 minutes</p></div>
				<div><p class="text-milk/60">Sampling Interval</p><p class="font-semibold">{experiment.samplingInterval}</p></div>
				<div><p class="text-milk/60">Last Updated</p><p class="font-semibold">11:35 AM</p></div>
			</div>
		</section>

		<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
			<!-- Experimental setup -->
			<section class="rounded-lg border border-milk/20 bg-espresso/50 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-caramel">Experimental Setup</h2>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div><p class="text-milk/60">SCG Batch</p><p class="font-semibold">{experiment.batch}</p></div>
					<div><p class="text-milk/60">Enclosure ID</p><p class="font-semibold">{experiment.enclosure}</p></div>
					<div><p class="text-milk/60">Enclosure Type</p><p class="font-semibold">Controlled shoebox</p></div>
					<div><p class="text-milk/60">Initial SCG Mass</p><p class="font-semibold">{experiment.initialMass} g</p></div>
					<div><p class="text-milk/60">RH Threshold</p><p class="font-semibold">{experiment.rhThreshold}%</p></div>
					<div><p class="text-milk/60">Packaging Condition</p><p class="font-semibold">Controlled enclosure</p></div>
				</div>
			</section>

			<!-- Hardware -->
			<section class="rounded-lg border border-milk/20 bg-espresso/50 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-caramel">Sensor and Hardware Configuration</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div class="flex justify-between rounded-md bg-ground/50 p-3"><span>SHT45 · RH/Temperature</span><span class="text-matcha">● Connected</span></div>
					<div class="flex justify-between rounded-md bg-ground/50 p-3"><span>ENS160 · eTVOC</span><span class="text-matcha">● Connected</span></div>
					<div class="flex justify-between rounded-md bg-ground/50 p-3"><span>HX711 + Load Cell</span><span class="text-matcha">● Connected</span></div>
					<div class="flex justify-between rounded-md bg-ground/50 p-3"><span>ESP32 · ESP32-001</span><span class="text-matcha">● Connected</span></div>
				</div>
				<p class="mt-3 text-sm text-milk/60">Communication: Local LAN · Last sensor check: 11:35 AM</p>
			</section>
		</div>

		<!-- Live monitoring -->
		<section class="my-5 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
				<h2 class="text-2xl font-semibold text-caramel">Live Monitoring</h2>
				<span class="text-sm text-milk/60">{status === 'Paused' ? 'Data collection paused' : 'Updated every 5 minutes'}</span>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-md border-2 border-navy bg-navy/20 p-4"><p class="text-sm text-milk/60">Relative Humidity</p><p class="text-3xl font-bold text-navy">{currentHumidity}%</p><p class="text-sm text-caramel">↑ Increasing</p></div>
				<div class="rounded-md border-2 border-berry bg-berry/20 p-4"><p class="text-sm text-milk/60">Temperature</p><p class="text-3xl font-bold text-berry">{currentTemperature}°C</p><p class="text-sm text-milk/70">→ Stable</p></div>
				<div class="rounded-md border-2 border-matcha bg-matcha/20 p-4"><p class="text-sm text-milk/60">eTVOC Index</p><p class="text-3xl font-bold text-matcha">{currentTvoc}</p><p class="text-sm text-milk/70">→ Stable</p></div>
				<div class="rounded-md border-2 border-caramel bg-caramel/20 p-4"><p class="text-sm text-milk/60">SCG Mass</p><p class="text-3xl font-bold text-caramel">{currentMass} g</p><p class="text-sm text-matcha">↑ Gaining Mass</p></div>
			</div>
		</section>

		<!-- Performance and prediction -->
		<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
			<section class="rounded-lg border border-caramel/70 bg-caramel/10 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-caramel">SCG Performance</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div><p class="text-sm text-milk/60">Initial Mass</p><p class="text-xl font-bold">{experiment.initialMass} g</p></div>
					<div><p class="text-sm text-milk/60">Current Mass</p><p class="text-xl font-bold">{currentMass} g</p></div>
					<div><p class="text-sm text-milk/60">Mass Gain</p><p class="text-xl font-bold">{massGain} g</p></div>
					<div><p class="text-sm text-milk/60">Adsorption Rate</p><p class="text-xl font-bold">{adsorptionRate} g/min</p></div>
				</div>
				<div class="mt-5 rounded-md bg-ground/50 p-3"><p class="text-sm text-milk/60">Current Condition</p><p class="text-lg font-semibold text-caramel">Actively Adsorbing</p></div>
			</section>

			<section class="rounded-lg border border-navy/70 bg-navy/10 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-navy">Prediction and Decision Support</h2>
				<div class="grid grid-cols-2 gap-4">
					<div><p class="text-sm text-milk/60">RH Threshold</p><p class="text-xl font-bold">{experiment.rhThreshold}%</p></div>
					<div><p class="text-sm text-milk/60">Estimated Protection Time</p><p class="text-xl font-bold">{protectionTime} hrs</p></div>
					<div><p class="text-sm text-milk/60">Model Status</p><p class="text-xl font-bold text-matcha">Prototype</p></div>
					<div><p class="text-sm text-milk/60">Confidence</p><p class="text-xl font-bold">Preliminary</p></div>
				</div>
				<div class="mt-5 rounded-md bg-ground/50 p-3"><p class="text-sm text-milk/60">Recommendation</p><p class="font-semibold">Continue monitoring. RH is below the selected threshold.</p></div>
			</section>
		</div>

		<!-- Detailed analysis -->
		<section class="my-5 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<div class="mb-4 flex flex-wrap gap-2">
				{#each ['Environmental', 'SCG Performance', 'Prediction', 'Data Table'] as tab}
					<button class={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-caramel text-espresso' : 'bg-ground/60 text-milk/70 hover:text-milk'}`} onclick={() => (activeTab = tab)}>{tab}</button>
				{/each}
			</div>

			{#if activeTab === 'Environmental'}
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
					<div class="rounded-md bg-navy/15 p-3"><h3 class="font-semibold text-navy">Relative Humidity</h3><Plot height={180}><Line x="x" y="y" data={humidity} stroke={colors.navy} strokeWidth={3} /></Plot></div>
					<div class="rounded-md bg-berry/15 p-3"><h3 class="font-semibold text-berry">Temperature</h3><Plot height={180}><Line x="x" y="y" data={temperature} stroke={colors.berry} strokeWidth={3} /></Plot></div>
					<div class="rounded-md bg-matcha/15 p-3"><h3 class="font-semibold text-matcha">eTVOC</h3><Plot height={180}><Line x="x" y="y" data={tvoc} stroke={colors.matcha} strokeWidth={3} /></Plot></div>
				</div>
			{:else if activeTab === 'SCG Performance'}
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<div class="rounded-md bg-caramel/15 p-3"><h3 class="font-semibold text-caramel">SCG Mass Over Time</h3><Plot height={200}><Line x="x" y="y" data={mass} stroke={colors.caramel} strokeWidth={3} /></Plot></div>
					<div class="rounded-md bg-ground/70 p-4"><h3 class="mb-3 font-semibold">Performance Interpretation</h3><p class="text-sm text-milk/75">Mass gain indicates possible moisture adsorption. Continue observing the adsorption rate; a sustained low rate may indicate that the SCG is approaching operational saturation.</p></div>
				</div>
			{:else if activeTab === 'Prediction'}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="rounded-md bg-navy/20 p-4"><p class="text-sm text-milk/60">Estimated Protection Time</p><p class="text-3xl font-bold text-navy">{protectionTime} hrs</p></div>
					<div class="rounded-md bg-caramel/20 p-4"><p class="text-sm text-milk/60">Fuzzy Condition</p><p class="text-xl font-bold text-caramel">Actively Adsorbing</p></div>
					<div class="rounded-md bg-matcha/20 p-4"><p class="text-sm text-milk/60">Recommendation</p><p class="text-xl font-bold text-matcha">Continue Monitoring</p></div>
				</div>
			{:else}
				<div class="overflow-x-auto"><table class="w-full min-w-[650px] text-left text-sm"><thead class="border-b border-milk/20 text-milk/60"><tr><th class="p-2">Time</th><th class="p-2">RH</th><th class="p-2">Temperature</th><th class="p-2">eTVOC</th><th class="p-2">Mass</th></tr></thead><tbody>{#each recentReadings as reading}<tr class="border-b border-milk/10"><td class="p-2">{reading.time}</td><td class="p-2">{reading.rh}%</td><td class="p-2">{reading.temp}°C</td><td class="p-2">{reading.tvoc}</td><td class="p-2">{reading.mass.toFixed(1)} g</td></tr>{/each}</tbody></table></div>
			{/if}
		</section>

		<!-- Timeline and data quality -->
		<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
			<section class="rounded-lg border border-milk/20 bg-espresso/50 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-caramel">Experiment Timeline</h2>
				<div class="space-y-3">{#each timeline as item}<div class="flex gap-4 border-l-2 border-caramel pl-4"><span class="w-20 shrink-0 text-sm text-milk/60">{item.time}</span><span class="text-sm">{item.event}</span></div>{/each}</div>
			</section>

			<section class="rounded-lg border border-milk/20 bg-espresso/50 p-5">
				<h2 class="mb-4 text-2xl font-semibold text-caramel">Data Quality and Sensor Health</h2>
				<div class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
					<div><p class="text-milk/60">Total Readings</p><p class="text-xl font-bold">432</p></div>
					<div><p class="text-milk/60">Valid Readings</p><p class="text-xl font-bold">428</p></div>
					<div><p class="text-milk/60">Missing Readings</p><p class="text-xl font-bold">4</p></div>
					<div><p class="text-milk/60">Completeness</p><p class="text-xl font-bold text-matcha">99.1%</p></div>
				</div>
				<p class="mt-5 rounded-md bg-matcha/15 p-3 text-sm text-matcha">● Sensors are connected. Minor missing readings detected and recorded.</p>
			</section>
		</div>

		<!-- Pause notes and alerts -->
		<section class="my-5 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Alerts, Notes, and Status History</h2>
			<div class="mb-4 rounded-md bg-caramel/15 p-3 text-sm text-caramel"><AlertIcon class="mr-1 inline-block h-5" /> No critical alerts. RH is below the configured threshold.</div>
			{#if status === 'Paused'}
				<label class="mb-2 block text-sm text-milk/70" for="pause-reason">Reason for pause</label>
				<input id="pause-reason" bind:value={pauseReason} class="mb-4 w-full rounded-md bg-ground p-3 text-milk outline-none ring-caramel focus:ring-2" placeholder="Example: Load-cell recalibration" />
			{/if}
			<label class="mb-2 block text-sm text-milk/70" for="experiment-notes">Experiment notes</label>
			<textarea id="experiment-notes" bind:value={notes} class="min-h-24 w-full rounded-md bg-ground p-3 text-milk outline-none ring-caramel focus:ring-2" placeholder="Add observations about the enclosure, SCG, or sensors..."></textarea>
		</section>
	</div>
</div>
