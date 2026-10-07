<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';
	import ArrowLeftIcon from '@iconify-svelte/mdi/arrow-left';
	import PauseIcon from '@iconify-svelte/mdi/pause';
	import PlayIcon from '@iconify-svelte/mdi/play';
	import CheckCircleIcon from '@iconify-svelte/mdi/check-circle';
	import DownloadIcon from '@iconify-svelte/mdi/download';
	import AlertIcon from '@iconify-svelte/mdi/alert';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { get } from 'svelte/store';

	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import { colors } from '$lib/colors';
	import {
		experimentStore,
		setExperimentStatus,
		updateExperiment,
		type ReportStatus
	} from '$lib/dummyData/experimentStore';

	// The experiment shown here is whichever one matches the [id] in the URL.
	const experiment = $derived($experimentStore.find((e) => e.id === page.params.id));
	const status = $derived<ReportStatus>(experiment?.status ?? 'Active');

	// Another experiment that is currently running (only one can be Active).
	const otherActive = $derived(
		$experimentStore.find((e) => e.status === 'Active' && e.id !== experiment?.id)
	);

	let activeTab = $state('Environmental');
	let pauseReason = $state('');
	let notes = $state(get(experimentStore).find((e) => e.id === page.params.id)?.notes ?? '');
	let showResumeDialog = $state(false);

	const rhThreshold = 75;
	const initialMass = $derived(experiment?.initialMass ?? 0);
	const samplingInterval = $derived(
		experiment?.interval ? `${experiment.interval} minutes` : 'Defaulted on 1 minute'
	);
	const dimensions = $derived(
		experiment?.length && experiment?.width && experiment?.height
			? `${experiment.length} × ${experiment.width} × ${experiment.height} cm`
			: '—'
	);

	function createTrend(base: number, variation: number) {
		let value = base;
		return d3.range(40).map((x) => {
			value += (Math.random() - 0.42) * variation;
			return { x, y: value };
		});
	}

	const humidity = createTrend(50, 0.7);
	const temperature = createTrend(29, 0.35);
	const startMass = get(experimentStore).find((e) => e.id === page.params.id)?.initialMass ?? 46;
	const mass = createTrend(startMass + 0.2, 0.08);
	const tvoc = createTrend(61, 0.8);

	const currentHumidity = Math.round(humidity.at(-1)?.y ?? 50);
	const currentTemperature = Math.round(temperature.at(-1)?.y ?? 29);
	const currentMass = Math.round((mass.at(-1)?.y ?? 46) * 10) / 10;
	const massGain = $derived(Math.round((currentMass - initialMass) * 10) / 10);
	const currentTvoc = Math.round(tvoc.at(-1)?.y ?? 61);
	const adsorptionRate = 0.015;
	const protectionTime = Math.max(0, Math.round((rhThreshold - currentHumidity) * 1.8 * 10) / 10);

	const timeline = [
		{ time: '9:00 AM', event: 'Experiment started' },
		{ time: '9:05 AM', event: 'Initial sensor reading recorded' },
		{ time: '9:30 AM', event: 'SCG mass gain detected' },
		{ time: '10:15 AM', event: `RH reached ${currentHumidity}%` },
		{ time: '11:00 AM', event: 'Adsorption rate calculated' },
		{ time: '11:35 AM', event: 'Latest sensor reading received' }
	];

	const recentReadings = [
		{
			time: '11:35 AM',
			rh: currentHumidity,
			temp: currentTemperature,
			tvoc: currentTvoc,
			mass: currentMass
		},
		{ time: '11:30 AM', rh: 51, temp: 29, tvoc: 60, mass: currentMass - 0.1 },
		{ time: '11:25 AM', rh: 50, temp: 29, tvoc: 59, mass: currentMass - 0.2 },
		{ time: '11:20 AM', rh: 50, temp: 28, tvoc: 61, mass: currentMass - 0.3 }
	];

	function changeStatus(nextStatus: ReportStatus) {
		if (!experiment) return;
		// Resuming while another experiment is running needs confirmation first.
		if (nextStatus === 'Active' && otherActive) {
			showResumeDialog = true;
			return;
		}
		setExperimentStatus(experiment.id, nextStatus);
	}

	function confirmResume() {
		if (experiment) setExperimentStatus(experiment.id, 'Active'); // pauses the other one
		showResumeDialog = false;
	}

	function saveNotes() {
		if (experiment) updateExperiment(experiment.id, { notes });
	}

	function statusClass(currentStatus: ReportStatus) {
		if (currentStatus === 'Active') return 'bg-caramel';
		if (currentStatus === 'Paused') return 'bg-lavender';
		return 'bg-matcha';
	}
</script>

{#if !experiment}
	<div class="mx-auto max-w-xl px-6 py-16 text-center text-milk">
		<h1 class="mb-2 text-3xl font-bold">Report not found</h1>
		<p class="mb-6 text-milk/70">No experiment with ID “{page.params.id}” exists.</p>
		<BaseButton palette="caramel" onclick={() => goto(resolve('/(app)/reports'))}>
			<ArrowLeftIcon class="h-5" /> Back to Reports
		</BaseButton>
	</div>
{:else}
	<!-- Header -->
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div>
			<button
				class="mb-3 flex items-center gap-1 text-caramel hover:text-milk"
				onclick={() => goto(resolve('/(app)/reports'))}
			>
				<ArrowLeftIcon class="h-5" /> Back to Reports
			</button>
			<h1 class="text-4xl font-bold">Experiment Details</h1>
			<p class="text-milk/70">{experiment.name ? `${experiment.name} · ` : ''}{experiment.id}</p>
		</div>

		<div class="flex flex-wrap gap-2">
			{#if status === 'Active'}
				<BaseButton palette="caramel" onclick={() => changeStatus('Paused')}>
					<PauseIcon class="h-5" /> Pause
				</BaseButton>
			{:else if status === 'Paused'}
				<BaseButton palette="lavender" onclick={() => changeStatus('Active')}>
					<PlayIcon class="h-5" /> Resume
				</BaseButton>
			{:else}
				<BaseButton palette="navy"><DownloadIcon class="h-5" /> Export Report</BaseButton>
			{/if}

			{#if status !== 'Complete'}
				<BaseButton palette="matcha" onclick={() => changeStatus('Complete')}>
					<CheckCircleIcon class="h-5" /> Complete Experiment
				</BaseButton>
			{/if}
		</div>
	</div>

	<!-- Status and configuration -->
	<section class="mb-5 rounded-lg border border-almond/50 bg-hazelnut p-5">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">Status & Configuration</h2>
		<div class="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
			<div>
				<p class="opacity-60">Experiment ID</p>
				<p class="text-lg font-semibold">{experiment.id}</p>
			</div>
			<div>
				<p class="opacity-60">Status</p>
				<p class={`w-fit mt-1 px-2 p-0.5 text-sm rounded-full font-semibold ${statusClass(status)}`}>{status}</p>
			</div>
			<div>
				<p class="opacity-60">Planned Duration</p>
				<p class="font-semibold">
					{experiment.duration ? `${experiment.duration} hours` : 'Indefinite'}
				</p>
			</div>
			<div>
				<p class="opacity-60">Created Date</p>
				<p class="font-semibold">{experiment.start}</p>
			</div>
			<div>
				<p class="opacity-60">Start Date</p>
				<p class="font-semibold">{experiment.start}</p>
			</div>
			<div>
				<p class="opacity-60">Elapsed Time</p>
				<p class="font-semibold">2 hours 35 minutes</p>
			</div>
			<div>
				<p class="opacity-60">Sampling Interval</p>
				<p class="font-semibold">{samplingInterval}</p>
			</div>
			<div>
				<p class="opacity-60">Last Updated</p>
				<p class="font-semibold">11:35 AM</p>
			</div>
		</div>
	</section>

	<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
		<!-- Experimental setup -->
		<section class="rounded-lg border border-almond/50 bg-hazelnut p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Experimental Setup</h2>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<p class="opacity-60">SCG Batch</p>
					<p class="font-semibold">{experiment.batch}</p>
				</div>
				<div>
					<p class="opacity-60">Package Type</p>
					<p class="font-semibold">{experiment.package}</p>
				</div>
				<div>
					<p class="opacity-60">Dimensions (L × W × H)</p>
					<p class="font-semibold">{dimensions}</p>
				</div>
				<div>
					<p class="opacity-60">Volume</p>
					<p class="font-semibold">
						{experiment.volume != null ? `${experiment.volume.toFixed(2)} L` : '—'}
					</p>
				</div>
				<div>
					<p class="opacity-60">Initial SCG Mass</p>
					<p class="font-semibold">
						{experiment.initialMass != null ? `${experiment.initialMass} g` : '—'}
					</p>
				</div>
				<div>
					<p class="opacity-60">RH Threshold</p>
					<p class="font-semibold">{rhThreshold}%</p>
				</div>
				<div>
					<p class="opacity-60">Preparation</p>
					<p class="font-semibold">{experiment.preparation ?? '—'}</p>
				</div>
			</div>
		</section>

		<!-- Hardware -->
		<section class="flex flex-col rounded-lg border border-almond/50 bg-hazelnut p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Sensor and Hardware Configuration</h2>
			<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
				<div class="flex justify-between rounded-md bg-ground p-3">
					<span>SHT45 · RH/Temperature</span><span class="text-matcha">● Connected</span>
				</div>
				<div class="flex justify-between rounded-md bg-ground p-3">
					<span>ENS160 · eTVOC</span><span class="text-matcha">● Connected</span>
				</div>
				<div class="flex justify-between rounded-md bg-ground p-3">
					<span>HX711 + Load Cell</span><span class="text-matcha">● Connected</span>
				</div>
				<div class="flex justify-between rounded-md bg-ground p-3">
					<span>ESP32 · {experiment.sensorNode ?? '—'}</span><span class="text-matcha"
						>● Connected</span
					>
				</div>
			</div>
			<p class="mt-auto text-sm opacity-60">
				Communication: Local LAN · Last sensor check: 11:35 AM
			</p>
		</section>
	</div>

	<!-- Live monitoring -->
	<section class="my-5 rounded-lg border border-almond/50 bg-hazelnut p-5">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold text-caramel">Live Monitoring</h2>
			<span class="text-sm text-milk/60"
				>{status === 'Paused' ? 'Data collection paused' : 'Updates every 5 minutes'}</span
			>
		</div>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-md border-2 border-navy bg-navy/75 p-4">
				<p class="text-sm text-milk/80">Relative Humidity</p>
				<span class="flex flex-row items-center">
					<p class="text-3xl font-bold">{currentHumidity}%</p>
					<p class="ml-auto w-fit rounded-full bg-caramel p-1 px-2 text-sm">↑ Increasing</p>
				</span>
			</div>
			<div class="rounded-md border-2 border-berry bg-berry/75 p-4">
				<p class="text-sm text-milk/80">Temperature</p>
				<span class="flex flex-row items-center">
					<p class="text-3xl font-bold">{currentTemperature} °C</p>
					<p class="ml-auto w-fit rounded-full bg-milk p-1 px-2 text-sm text-ground">→ Stable</p>
				</span>
			</div>
			<div class="rounded-md border-2 border-matcha bg-matcha/75 p-4">
				<p class="text-sm text-milk/80">eTVOC Index</p>
				<span class="flex flex-row items-center">
					<p class="text-3xl font-bold">{currentTvoc} ppb</p>
					<p class="ml-auto w-fit rounded-full bg-milk p-1 px-2 text-sm text-ground">→ Stable</p>
				</span>
			</div>
			<div class="rounded-md border-2 border-caramel bg-caramel/75 p-4">
				<p class="text-sm text-milk/80">SCG Mass</p>
				<span class="flex items-center">
					<p class="text-3xl font-bold">{currentMass} g</p>
					<p class="ml-auto w-fit rounded-full bg-matcha p-1 px-2 text-sm">↑ Gaining Mass</p>
				</span>
			</div>
		</div>
	</section>

	<!-- Performance and prediction -->
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
		<section class="flex flex-col rounded-lg border border-caramel bg-caramel/75 p-5">
			<h2 class="mb-4 text-2xl font-semibold">SCG Performance</h2>
			<div class="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
			<div class="mt-auto rounded-md bg-hazelnut p-3">
				<p class="text-sm text-milk/60">Current Condition</p>
				<p class="text-lg font-semibold text-caramel">Actively Adsorbing</p>
			</div>
		</section>

		<section class="flex flex-col rounded-lg border border-navy bg-navy/75 p-5">
			<h2 class="mb-4 text-2xl font-semibold">Prediction and Decision Support</h2>
			<div class="mb-4 grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-milk/60">RH Threshold</p>
					<p class="text-xl font-bold">{rhThreshold}%</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Estimated Protection Time</p>
					<p class="text-xl font-bold">{protectionTime} hrs</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Model Status</p>
					<p class="text-xl font-bold text-matcha">Prototype</p>
				</div>
				<div>
					<p class="text-sm text-milk/60">Confidence</p>
					<p class="text-xl font-bold">Preliminary</p>
				</div>
			</div>
			<div class="mt-auto rounded-md bg-ground/50 p-3">
				<p class="text-sm text-milk/60">Recommendation</p>
				<p class="text-lg font-semibold">
					Continue monitoring. RH is below the selected threshold.
				</p>
			</div>
		</section>
	</div>

	<!-- Detailed analysis -->
	<section class="my-5 rounded-lg border border-almond/50 bg-hazelnut p-5">
		<div class="mb-4 flex flex-wrap gap-2">
			{#each ['Environmental', 'SCG Performance', 'Prediction', 'Data Table'] as tab (tab)}
				<button
					class={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-caramel text-espresso' : 'bg-ground/60 text-milk/70 hover:text-milk'}`}
					onclick={() => (activeTab = tab)}>{tab}</button
				>
			{/each}
		</div>

		{#if activeTab === 'Environmental'}
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div class="rounded-md bg-navy/75 p-3">
					<h3 class="font-semibold">Relative Humidity</h3>
					<Plot height={180}
						><Line x="x" y="y" data={humidity} stroke={colors.milk} strokeWidth={3} /></Plot
					>
				</div>
				<div class="rounded-md bg-berry/75 p-3">
					<h3 class="font-semibold">Temperature</h3>
					<Plot height={180}
						><Line x="x" y="y" data={temperature} stroke={colors.milk} strokeWidth={3} /></Plot
					>
				</div>
				<div class="rounded-md bg-matcha/75 p-3">
					<h3 class="font-semibold">Total Volatile Organic Compounds</h3>
					<Plot height={180}
						><Line x="x" y="y" data={tvoc} stroke={colors.matcha} strokeWidth={3} /></Plot
					>
				</div>
			</div>
		{:else if activeTab === 'SCG Performance'}
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded-md bg-caramel/75 p-3">
					<h3 class="font-semibold">SCG Mass Over Time</h3>
					<Plot height={200}
						><Line x="x" y="y" data={mass} stroke={colors.milk} strokeWidth={3} /></Plot
					>
				</div>
				<div class="rounded-md bg-ground/70 p-4">
					<h3 class="mb-3 font-semibold">Performance Interpretation</h3>
					<p class="text-sm text-milk/75">
						Mass gain indicates possible moisture adsorption. Continue observing the adsorption
						rate; a sustained low rate may indicate that the SCG is approaching operational
						saturation.
					</p>
				</div>
			</div>
		{:else if activeTab === 'Prediction'}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-md bg-navy p-4">
					<p class="text-sm text-milk/60">Estimated Protection Time</p>
					<p class="text-3xl font-bold">{protectionTime} hrs</p>
				</div>
				<div class="rounded-md bg-caramel p-4">
					<p class="text-sm text-milk/60">Fuzzy Condition</p>
					<p class="text-xl font-bold">Actively Adsorbing</p>
				</div>
				<div class="rounded-md bg-matcha p-4">
					<p class="text-sm text-milk/60">Recommendation</p>
					<p class="text-xl font-bold">Continue Monitoring</p>
				</div>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[650px] text-left text-sm">
					<thead class="border-b border-milk/20 text-milk/60"
						><tr
							><th class="p-2">Time</th><th class="p-2">RH</th><th class="p-2">Temperature</th><th
								class="p-2">eTVOC</th
							><th class="p-2">Mass</th></tr
						></thead
					>
					<tbody>
						{#each recentReadings as reading (reading.time)}
							<tr class="border-b border-milk/10">
								<td class="p-2">{reading.time}</td>
								<td class="p-2">{reading.rh}%</td>
								<td class="p-2">{reading.temp}°C</td>
								<td class="p-2">{reading.tvoc}</td>
								<td class="p-2">{reading.mass.toFixed(1)} g</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- Timeline and data quality -->
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
		<section class="rounded-lg border border-almond/50 bg-hazelnut p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Experiment Timeline</h2>
			<div class="space-y-3">
				{#each timeline as item}<div class="flex gap-4 border-l-2 border-caramel pl-4">
						<span class="w-20 shrink-0 text-sm text-milk/60">{item.time}</span><span class="text-sm"
							>{item.event}</span
						>
					</div>{/each}
			</div>
		</section>

		<section class="rounded-lg border border-almond/50 bg-hazelnut p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Data Quality and Sensor Health</h2>
			<div class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
				<div>
					<p class="text-milk/60">Total Readings</p>
					<p class="text-xl font-bold">432</p>
				</div>
				<div>
					<p class="text-milk/60">Valid Readings</p>
					<p class="text-xl font-bold">428</p>
				</div>
				<div>
					<p class="text-milk/60">Missing Readings</p>
					<p class="text-xl font-bold">4</p>
				</div>
				<div>
					<p class="text-milk/60">Completeness</p>
					<p class="text-xl font-bold text-matcha">99.1%</p>
				</div>
			</div>
			<p class="mt-5 rounded-md bg-matcha p-3 text-sm text-milk">
				● Sensors are connected. Minor missing readings detected and recorded.
			</p>
		</section>
	</div>

	<!-- Pause notes and alerts -->
	<section class="my-5 rounded-lg border border-almond/50 bg-hazelnut p-5">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">Alerts, Notes, and Status History</h2>
		<div class="mb-4 w-fit rounded-md bg-matcha p-3 text-sm text-milk">
			<AlertIcon class="mr-1 inline-block h-5" /> No critical alerts. RH is below the configured threshold.
		</div>
		{#if status === 'Paused'}
			<label class="mb-2 block text-sm text-milk/70" for="pause-reason">Reason for pause</label>
			<input
				id="pause-reason"
				bind:value={pauseReason}
				class="mb-4 w-full rounded-md bg-ground p-3 text-milk ring-caramel outline-none focus:ring-2"
				placeholder="Example: Load-cell recalibration"
			/>
		{/if}
		<label class="mb-2 block text-sm text-milk/70" for="experiment-notes">Experiment notes</label>
		<textarea
			id="experiment-notes"
			bind:value={notes}
			onblur={saveNotes}
			class="min-h-24 w-full rounded-md bg-ground p-3 text-milk ring-caramel outline-none focus:ring-2"
			placeholder="Add observations about the enclosure, SCG, or sensors..."></textarea>
	</section>

	<!-- Resume conflict dialog: another experiment is already active -->
	{#if showResumeDialog && otherActive}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (showResumeDialog = false)}
		>
			<div
				class="w-full max-w-md rounded-lg border border-milk/30 bg-espresso p-6 shadow-xl"
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="resume-title"
				aria-describedby="resume-desc"
			>
				<h2 id="resume-title" class="mb-2 text-lg font-semibold text-caramel">
					Another experiment is ongoing
				</h2>
				<p id="resume-desc" class="mb-6 text-sm text-milk/80">
					<span class="font-semibold">{otherActive.id}</span> is currently active. Only one
					experiment can be active at a time. If you continue,
					<span class="font-semibold">{otherActive.id}</span>
					will be paused and <span class="font-semibold">{experiment.id}</span> will resume as the active
					experiment.
				</p>
				<div class="flex justify-end gap-3">
					<BaseButton palette="navy" onclick={() => (showResumeDialog = false)}>Cancel</BaseButton>
					<BaseButton palette="caramel" onclick={confirmResume}>Pause other &amp; resume</BaseButton
					>
				</div>
			</div>
		</div>
	{/if}
{/if}
