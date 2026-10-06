<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import AddIcon from '@iconify-svelte/mdi/add';
	import SearchIcon from '@iconify-svelte/mdi/search';

	let searchQuery = $state('');
	let statusFilter = $state('All');

	// 2. Data
	const allExperiments: {
		id: string;
		batch: string;
		package: string;
		start: string;
		status: 'Active' | 'Complete' | null;
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
		{ id: 'EXP-004', batch: 'SCG-004', package: 'Crate', start: 'Sep 25, 2026', status: 'Active' },
		{ id: 'EXP-005', batch: 'SCG-005', package: 'Pouch', start: 'Oct 01, 2026', status: 'Active' }
	];

	// 3. Reactive filtering using $derived
	let filteredExperiments = $derived(
		allExperiments.filter((exp) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				exp.id.toLowerCase().includes(query) || exp.batch.toLowerCase().includes(query);
			const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	function getStatusColor(status: 'Active' | 'Complete' | null) {
		const baseClasses = 'border-2 group-hover:bg-oat group-hover:border-ground';

		if (status === 'Active') return `${baseClasses} bg-caramel/15 text-caramel border-caramel`;
		if (status === 'Complete') return `${baseClasses} bg-matcha/15 text-matcha border-matcha`;
		return 'bg-gray-800 text-gray-300';
	}
</script>

<!-- Page Content -->
<div class="mx-auto w-full max-w-5xl p-8">
	<div class="mb-8 flex items-end justify-between">
		<div>
			<h1 class="mb-2 text-3xl font-semibold text-ground">Experiments</h1>
			<p class="text-textMuted">Search and monitor batch statuses.</p>
		</div>
		<button
			onclick={() => goto(resolve('/(app)/experiments/new'))}
			class="flex items-center space-x-2 rounded bg-caramel px-5 py-2.5 font-medium text-milk shadow-sm transition-colors hover:bg-[#a6652c]"
		>
			<AddIcon class="h-6" />
			<span>New Experiment</span>
		</button>
	</div>

	<!-- Filter Controls -->
	<div class="bg-oat border-ground flex flex-wrap items-end gap-6 rounded-t-lg border p-5">
		<div class="min-w-50 flex-1">
			<label class="text-textMuted mb-1 block text-sm font-medium" for="search"
				>Search experiment</label
			>
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<SearchIcon class="h-6" />
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
				<option value="Complete">Complete</option>
			</select>
		</div>
	</div>

	<!-- Interactive Table -->
	<div class="bg-panel border-borderClr overflow-hidden rounded-b-lg border border-t-0 shadow">
		<table class="divide-borderClr min-w-full divide-y">
			<thead class="bg-mocha text-almond">
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
			<tbody class="divide-borderClr bg-panel divide-y">
				{#each filteredExperiments as exp (exp.id)}
					<tr class="group text-ground transition-colors hover:bg-slate">
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
    						href={resolve(`/experiments/${exp.id}`)}
    						class="rounded-md p-2 text-caramel transition-colors group-hover:bg-espresso group-hover:text-almond hover:bg-almond hover:text-ground hover:underline">
    							View
							</a>
						</td>
					</tr>
				{/each}
				{#if filteredExperiments.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-almond italic">
							No experiments match your filters.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	:global(body) {
		background-color: #2b211e;
		margin: 0;
	}
	:global(::-webkit-scrollbar) {
		width: 8px;
	}
	:global(::-webkit-scrollbar-track) {
		background: #2b211e;
	}
	:global(::-webkit-scrollbar-thumb) {
		background: #5c433b;
		border-radius: 4px;
	}
	:global(::-webkit-scrollbar-thumb:hover) {
		background: #b87333;
	}
</style>
