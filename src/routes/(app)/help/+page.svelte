<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	let search = $state('');

	// Quick start: how the app flows
	const steps = [
		{
			title: 'Create an experiment',
			body: 'Go to Reports → New Report. Fill in every field (name, SCG mass, package size, duration, sampling interval and sensor node). "Continue to Setup" stays disabled until all fields are complete.'
		},
		{
			title: 'Only one can run at a time',
			body: 'If another experiment is already Active, you will be warned. Continuing pauses the previous experiment and starts the new one. Cancelling returns you to your draft.'
		},
		{
			title: 'Monitor on the Home page',
			body: 'The Home page always shows the currently Active experiment: live graphs, SCG performance and the humidity prediction. If none is active, it tells you to go to Reports.'
		},
		{
			title: 'Manage from the report details',
			body: 'Open any report with View to pause, resume, complete, or add notes. Resuming a paused experiment while another is active will pause the other one after you confirm.'
		}
	];

	const statuses = [
		{ name: 'Active', cls: 'bg-matcha text-espresso', desc: 'Currently collecting data. Only one experiment can be Active.' },
		{ name: 'Paused', cls: 'bg-caramel text-espresso', desc: 'Data collection stopped. It can be resumed later.' },
		{ name: 'Complete', cls: 'bg-navy text-milk', desc: 'Experiment finished. The report can be exported.' }
	];

	const glossary = [
		{ term: 'SCG', def: 'Spent coffee grounds, used as the moisture-adsorbing material.' },
		{ term: 'RH', def: 'Relative humidity inside the package, measured by the SHT45 sensor.' },
		{ term: 'RH Threshold', def: 'The humidity level (75%) above which the packaged product is at risk.' },
		{ term: 'eTVOC', def: 'Estimated total volatile organic compounds, measured by the ENS160 sensor.' },
		{ term: 'Mass Gain', def: 'Current SCG mass minus its initial mass. A gain suggests moisture adsorption.' },
		{ term: 'Adsorption Rate', def: 'How fast the SCG mass is increasing, in grams per minute.' },
		{ term: 'Estimated Protection Time', def: 'A prototype estimate of how long the SCG can keep RH below the threshold.' },
		{ term: 'Sampling Interval', def: 'How often the sensor node records a reading (1–60 minutes).' }
	];

	const faqs = [
		{
			q: 'Why can I not click "Continue to Setup"?',
			a: 'All inputs must be completed with valid values. The footer lists which fields are still missing.'
		},
		{
			q: 'Why was my previous experiment paused?',
			a: 'Only one experiment can be Active. Starting or resuming another experiment automatically pauses the one that was running.'
		},
		{
			q: 'Why does Home say there is no active experiment?',
			a: 'Every experiment is Paused or Complete. Open Reports and resume one, or create a new experiment.'
		},
		{
			q: 'Can I edit an experiment after creating it?',
			a: 'Setup values are fixed once created. You can change the status and the experiment notes from the report details page.'
		},
		{
			q: 'Are the graphs and predictions real?',
			a: 'The current version uses demo data and a prototype prediction model. Treat the numbers as preliminary.'
		},
		{
			q: 'Where is my data saved?',
			a: 'Reports are saved in this browser (local storage). Clearing site data or using another browser will not show them.'
		}
	];

	const troubleshooting = [
		{ issue: 'No sensor readings', fix: 'Check that the ESP32 node is powered and on the same local network as the app, then use "Refetch Sensor Data" on Home.' },
		{ issue: 'Mass looks wrong or jumps', fix: 'Re-tare the HX711 load cell with the empty container, and keep the package from touching the sides.' },
		{ issue: 'RH reads unusually high', fix: 'Make sure the SHT45 is not touching the SCG and that the lid is sealed.' },
		{ issue: 'Missing readings', fix: 'Minor gaps are normal on Wi-Fi. If many are missing, shorten the distance to the router or increase the sampling interval.' }
	];

	const q = $derived(search.trim().toLowerCase());
	const filteredFaqs = $derived(
		faqs.filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
	);
	const filteredGlossary = $derived(
		glossary.filter((g) => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
	);
</script>

<div class="mx-auto w-full max-w-5xl p-8 text-milk">
	<div class="mb-6">
		<h1 class="mb-1 text-3xl font-semibold">Help</h1>
		<p class="text-cream">Guides, definitions and troubleshooting for monitoring SCG experiments.</p>
	</div>

	<input
		type="text"
		bind:value={search}
		placeholder="Search help topics..."
		class="mb-6 block w-full rounded-md border border-espresso bg-cream px-3 py-2 text-ground placeholder-mocha focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none"
	/>

	<!-- Quick start -->
	{#if !q}
		<section class="mb-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Quick Start</h2>
			<ol class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each steps as step, i (step.title)}
					<li class="rounded-md bg-ground/50 p-4">
						<p class="mb-1 font-semibold">
							<span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-sm text-espresso">{i + 1}</span>{step.title}
						</p>
						<p class="text-sm text-milk/75">{step.body}</p>
					</li>
				{/each}
			</ol>
			<div class="mt-4 flex flex-wrap gap-3">
				<BaseButton palette="matcha" onclick={() => goto(resolve('/(app)/reports/new'))}>New Report</BaseButton>
				<BaseButton palette="navy" onclick={() => goto(resolve('/(app)/reports'))}>View Reports</BaseButton>
			</div>
		</section>

		<!-- Status meanings -->
		<section class="mb-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Experiment Statuses</h2>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{#each statuses as s (s.name)}
					<div class="rounded-md bg-ground/50 p-4">
						<span class="mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold {s.cls}">{s.name}</span>
						<p class="text-sm text-milk/75">{s.desc}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- FAQ -->
	<section class="mb-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">Frequently Asked Questions</h2>
		<div class="space-y-2">
			{#each filteredFaqs as faq (faq.q)}
				<details class="group rounded-md bg-ground/50 p-3">
					<summary class="cursor-pointer font-semibold marker:text-caramel">{faq.q}</summary>
					<p class="mt-2 text-sm text-milk/75">{faq.a}</p>
				</details>
			{/each}
			{#if filteredFaqs.length === 0}
				<p class="text-sm text-milk/60 italic">No questions match your search.</p>
			{/if}
		</div>
	</section>

	<!-- Glossary -->
	<section class="mb-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">Glossary</h2>
		<dl class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each filteredGlossary as g (g.term)}
				<div class="rounded-md bg-ground/50 p-3">
					<dt class="font-semibold text-caramel">{g.term}</dt>
					<dd class="text-sm text-milk/75">{g.def}</dd>
				</div>
			{/each}
			{#if filteredGlossary.length === 0}
				<p class="text-sm text-milk/60 italic">No terms match your search.</p>
			{/if}
		</dl>
	</section>

	<!-- Troubleshooting -->
	{#if !q}
		<section class="rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Sensor Troubleshooting</h2>
			<div class="space-y-3">
				{#each troubleshooting as t (t.issue)}
					<div class="rounded-md border-l-4 border-caramel bg-ground/50 p-3">
						<p class="font-semibold">{t.issue}</p>
						<p class="text-sm text-milk/75">{t.fix}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>