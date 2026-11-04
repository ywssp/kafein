<script lang="ts">
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

	const { data } = $props();

	let experimentList = $derived($experimentStore.slice(0, 5));
</script>

<PageHeader pageTitle="Home"></PageHeader>

<div class="overflow-hidden w-80 rounded-lg border border-almond p-4">
  <h2 class="text-xl font-semibold">Recent Recommendations</h2>
	<table class="mt-4 min-w-full">
		<thead class="bg-hazelnut text-almond">
			<tr>
				<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
					>Note</th
				>
				<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
					>Created At</th
				>
			</tr>
		</thead>
		<tbody class="divide-y divide-almond/25">
			{#each experimentList as recommendation (recommendation.id)}
				<tr
					class="group text-milk transition-colors hover:bg-almond/25"
					onclick={() => goto(resolve(`/(app)/history/[id]`, { id: recommendation.id }))}
				>
					<td class={[' px-6 py-4 text-sm whitespace-nowrap', recommendation.name || 'opacity-50']}
						>{recommendation.name ?? 'No Note'}</td
					>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-cream">{recommendation.start}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
