<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import { experimentStore } from '$lib/dummyData/experimentStore';
	import {
		contaminationOptions,
		materialOptions,
		equipmentOptions
	} from '$lib/recommend/options';

	import { Plot, BarX } from 'svelteplot';
	import CheckIcon from '@iconify-svelte/mdi/check-circle';

	let { data } = $props();

	const record = $derived(data.record);
	const form = $derived(record.form);
	const results = $derived(record.results ?? []);
	const top = $derived([...results].sort((a, b) => b.score - a.score)[0]);
	const chartData = $derived(results.map((r) => ({ label: r.title, value: r.score })));

	function deleteRecord() {
		if (!confirm('Do you want to delete this recommendation?')) return;
		experimentStore.update((list) => list.filter((e) => e.id !== record.id));
		goto(resolve('/(app)/history'));
	}
</script>

{#snippet checklist(title: string, options: string[], selected: string[])}
	<div>
		<h3 class="mb-2 text-xs font-medium tracking-wider text-almond uppercase">{title}</h3>
		<ul class="space-y-1.5 text-sm text-cream">
			{#each options as option (option)}
				{#if selected.includes(option)}
					<li class="flex items-center gap-1.5 font-medium">
						<CheckIcon class="h-4" />{option}
					</li>
				{:else}
					<li class="opacity-40">{option}</li>
				{/if}
			{/each}
		</ul>
	</div>
{/snippet}

{#snippet field(label: string, value: string)}
	<div>
		<h3 class="text-xs font-medium tracking-wider text-almond uppercase">{label}</h3>
		<p class="mt-0.5 text-sm font-semibold text-cream">{value}</p>
	</div>
{/snippet}

<PageHeader pageTitle="Record {record.id}" description="View your previous recommendation">
	<BaseButton palette="berry" onclick={deleteRecord}>Delete Record</BaseButton>
</PageHeader>

{#if !form || results.length === 0}
	<div class="mt-4 rounded-lg border border-almond bg-caramel/40 p-6 text-cream">
		<h2 class="text-xl font-semibold">No recommendation details saved</h2>
		<p class="mt-1 text-sm opacity-80">
			This record ({record.batch}, {record.start}) was created without recommendation data.
		</p>
	</div>
{:else}
	<div class="mt-4 rounded-lg border border-almond bg-matcha/50 p-4">
		<h2 class="text-xl font-semibold">Recommendation</h2>
		<p class="mt-1">
			The SCG batch is best suited for <u>{top.title}</u>
			({top.score}% – {top.level} suitability).
		</p>
		{#if form.intendedApp !== 'Explore All Applications'}
			<p class="mt-1 text-sm opacity-80">Your intended application: {form.intendedApp}</p>
		{/if}
	</div>

	<div class="mt-4 space-y-6 rounded-lg border border-almond bg-caramel/40 p-6">
		<h2 class="border-b border-almond/30 pb-3 text-xl font-semibold text-cream">Input Details</h2>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{@render field('Coffee Blend', form.coffeeBlend)}
			{@render field('Processing State', form.processingState)}
			{@render field('Moisture Condition', form.moistureCondition)}
			{@render field('Brewing Method & Cycles', `${form.brewingMethod} (${form.brewingCycles})`)}
			{@render field('Ground Size', form.groundSize)}
			{@render field('Amount & Storage', `${form.scgAmount} Grams (${form.storageDuration})`)}
			{@render field('Drying Condition', form.dryingCondition)}
			{@render field('Composting Status', form.compostingStatus)}
		</div>

		<div class="grid grid-cols-1 gap-6 border-t border-almond/30 pt-4 md:grid-cols-3">
			{@render checklist('Visible Contamination', contaminationOptions, form.contamination)}
			{@render checklist('Materials Mixed In', materialOptions, form.materials)}
			{@render checklist('Available Equipment', equipmentOptions, form.equipment)}
		</div>
	</div>

	<div class="mt-4 rounded-lg border border-almond bg-navy/50 p-4">
		<h2 class="text-xl font-semibold">System Interpretation</h2>

		<Plot marginLeft={180} x={{ domain: [0, 100] }}>
			<BarX data={chartData} x="value" y="label" />
		</Plot>

		<div class="mt-4 space-y-3">
			{#each results as item, i (item.id)}
				<details class="rounded-lg border border-almond/40 bg-black/10 p-3" open={i === 0}>
					<summary class="cursor-pointer font-semibold text-cream">
						{item.title} — {item.score}% ({item.level})
					</summary>
					<div class="mt-3 space-y-2 text-sm text-cream/90">
						<p>
							<strong>{item.predictionLabel}:</strong>
							{item.predictionValue}
						</p>
						<p class="font-mono text-xs opacity-70">
							{item.regressionFormula} · {item.regressionInputs}
						</p>
						<p><strong>Preparation:</strong> {item.recipe}</p>
						{#each item.supporting as reason (reason)}
							<p class="text-[#9be0af]">✓ {reason}</p>
						{/each}
						{#each item.limiting as reason (reason)}
							<p class="text-[#f29b94]">✕ {reason}</p>
						{/each}
						{#if item.remediation}
							<p><strong>To improve:</strong> {item.remediation}</p>
						{/if}
						<p class="text-xs opacity-60">Reference: {item.citation}</p>
					</div>
				</details>
			{/each}
		</div>
	</div>
{/if}