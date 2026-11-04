<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import { experimentStore } from '$lib/dummyData/experimentStore';
	import SearchIcon from '@iconify-svelte/mdi/search';

	let searchQuery = $state('');
	let statusFilter = $state('All');

	let filteredReports = $derived(
		$experimentStore.filter((exp) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				exp.id.toLowerCase().includes(query) ||
				exp.batch.toLowerCase().includes(query) ||
				(exp.name ?? '').toLowerCase().includes(query);
			const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
	);
</script>

<!-- Page Content -->
<PageHeader
	pageTitle="History"
	description="Browse and search previous recommendations"
></PageHeader>

<!-- Filter Controls -->
<div class="mx-auto mt-8 rounded-lg border-2 border-almond">
	<div class="flex flex-wrap items-end gap-6 rounded-t-lg bg-mocha p-5">
		<div class="min-w-50 flex-1">
			<label class="text-textMuted mb-1 block text-sm font-medium" for="search"
				>Search Recommendations</label
			>
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<SearchIcon class="h-6 text-hazelnut" />
				</div>
				<!-- Svelte Data Binding for Search -->
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Search Notes or ID"
					class="block w-full rounded-md border border-espresso bg-cream py-2 pr-3 pl-10 leading-5 text-ground placeholder-mocha transition-colors focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
				/>
			</div>
		</div>
	</div>

	<!-- Interactive Table -->
	<div class="overflow-hidden rounded-b-lg">
		<table class="min-w-full">
			<thead class="bg-hazelnut text-almond">
				<tr>
					<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>ID</th
					>
					<th scope="col" class=" px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>SCG Batch</th
					>
					<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Note</th
					>
					<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Created At</th
					>
					<th scope="col" class="px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Action</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-almond/25">
				{#each filteredReports as recommendation (recommendation.id)}
					<tr
						class="group text-milk transition-colors hover:bg-almond/25"
						onclick={() => goto(resolve(`/(app)/history/[id]`, { id: recommendation.id }))}
					>
						<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
							{recommendation.id}
						</td>
						<td class=" px-6 py-4 text-sm whitespace-nowrap">{recommendation.batch}</td>
						<td
							class={[' px-6 py-4 text-sm whitespace-nowrap', recommendation.name || 'opacity-50']}
							>{recommendation.name ?? 'No Note'}</td
						>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-cream">{recommendation.start}</td>
						<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
							<BaseButton
								palette="berry"
								onclick={(e) => {
									e.stopPropagation();
									confirm('Do you want to delete this recommendation?');
								}}>Delete</BaseButton
							>
						</td>
					</tr>
				{/each}
				{#if filteredReports.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-almond italic">
							No records match your filters.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
