<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	import AddIcon from '@iconify-svelte/mdi/add';
	import SearchIcon from '@iconify-svelte/mdi/search';

	let searchQuery = $state('');
	let statusFilter = $state('All');

	type ReportStatus =  'Active' | 'Paused' | 'Complete';

	// 2. Data
	const allReports: {
		id: string;
		batch: string;
		package: string;
		start: string;
		status: ReportStatus;
	}[] = [
		{
			id: 'EXP-001',
			batch: 'SCG-001',
			package: 'Shoebox',
			start: 'Sep 20, 2026',
			status: 'Active'
		},
		{
			id: 'EXP-002',
			batch: 'SCG-002',
			package: 'Pouch',
			start: 'Sep 18, 2026',
			status: 'Complete'
		},
		{
			id: 'EXP-003',
			batch: 'SCG-003',
			package: 'Shoebox',
			start: 'Sep 15, 2026',
			status: 'Complete'
		},
		{ id: 'EXP-004', batch: 'SCG-004', package: 'Crate', start: 'Sep 25, 2026', status: 'Paused' },
		{ id: 'EXP-005', batch: 'SCG-005', package: 'Pouch', start: 'Oct 01, 2026', status: 'Paused' }
	];

	// 3. Reactive filtering using $derived
	let filteredReports = $derived(
		allReports.filter((exp) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				exp.id.toLowerCase().includes(query) || exp.batch.toLowerCase().includes(query);
			const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	function getStatusColor(status: ReportStatus) {
		const baseClasses = 'border-2 transition-colors'
		if (status === 'Active') return `${baseClasses} bg-caramel/30 group-hover:bg-caramel group-hover:text-ground text-caramel border-caramel`;
		if (status === 'Complete') return `${baseClasses} bg-matcha/30 group-hover:bg-matcha group-hover:text-ground text-matcha border-matcha`;
		if (status === 'Paused') return `${baseClasses} bg-lavender/30 group-hover:bg-lavender group-hover:text-ground text-lavender border-lavender`;
		return 'bg-gray-800 text-gray-300';
	}
</script>

<!-- Page Content -->
<div class="mx-auto w-full max-w-5xl p-8">
	<div class="mb-8 flex items-end justify-between">
		<div class="flex items-center gap-4">
			<h1 class="mb-2 text-3xl font-semibold text-milk">Reports</h1>
			<p class="text-cream">Search and monitor batch reports</p>
		</div>
		<BaseButton
			onclick={() => goto(resolve('/(app)/reports/new'))}
			palette="matcha"
		>
			<AddIcon class="h-6" />
			<span class="leading-none">New Report</span>
		</BaseButton>
	</div>

	<!-- Filter Controls -->
	<div class="bg-mocha border-2 border-almond border-b-transparent flex flex-wrap items-end gap-6 rounded-t-lg p-5">
		<div class="min-w-50 flex-1">
			<label class="text-textMuted mb-1 block text-sm font-medium" for="search"
				>Search experiment</label
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
					placeholder="Search ID or Batch..."
					class="border-espresso bg-cream text-ground placeholder-mocha block w-full rounded-md border py-2 pr-3 pl-10 leading-5 transition-colors focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
				/>
			</div>
		</div>

		<div class="w-48">
			<label class="text-textMuted mb-1 block text-sm font-medium" for="status">Status</label>
			<!-- Svelte Data Binding for Select -->
			<select
				id="status"
				bind:value={statusFilter}
				class="border-espresso bg-cream text-ground block w-full rounded-md border py-2 pr-10 pl-3 transition-colors focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
			>
				<option value="All">All</option>
				<option value="Active">Active</option>
				<option value="Paused">Paused</option>
				<option value="Complete">Complete</option>
			</select>
		</div>
	</div>

	<!-- Interactive Table -->
	<div class="overflow-hidden rounded-b-lg border-2 border-almond border-t-0">
		<table class="min-w-full">
			<thead class="bg-hazelnut text-almond">
				<tr>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>ID</th
					>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>SCG Batch</th
					>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Package</th
					>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Start Date</th
					>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Status</th
					>
					<th
						scope="col"
						class="text-textMuted px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
						>Action</th
					>
				</tr>
			</thead>
			<tbody class="divide-almond/25 divide-y">
				{#each filteredReports as exp (exp.id)}
					<tr class="group text-milk transition-colors hover:bg-almond/25">
    					<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">{exp.id}</td>
						<td class="text-textMain px-6 py-4 text-sm whitespace-nowrap">{exp.batch}</td>
						<td class="text-textMain px-6 py-4 text-sm whitespace-nowrap">{exp.package}</td>
						<td class="text-textMuted px-6 py-4 text-sm whitespace-nowrap">{exp.start}</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full px-2 py-0.5 text-xs leading-5 font-semibold {getStatusColor(
									exp.status
								)}"
							>
								{exp.status}
							</span>
						</td>
						<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
							<a
    						href={resolve(`/(app)/reports/[id]`, { id: exp.id })}
    						class="rounded-md p-2 text-caramel transition-colors group-hover:bg-espresso group-hover:text-almond hover:bg-almond hover:text-ground hover:underline">
    							View
							</a>
						</td>
					</tr>
				{/each}
				{#if filteredReports.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-almond italic">
							No reports match your filters.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
