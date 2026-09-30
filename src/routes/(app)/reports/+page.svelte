<script lang="ts">
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	import CreateIcon from '@iconify-svelte/mdi/create';

	import {
		createTable,
		FlexRender,
		tableFeatures,
		rowSortingFeature,
		createSortedRowModel,
		sortFns
	} from '@tanstack/svelte-table';
	import type { ColumnDef } from '@tanstack/svelte-table';

	// 1. Define the shape of your data
	type Person = {
		firstName: string;
		lastName: string;
		age: number;
	};

	// 2. Store data with a $state rune for reactivity
	let data = $state<Array<Person>>([
		{ firstName: 'tanner', lastName: 'linsley', age: 24 },
		{ firstName: 'tandy', lastName: 'miller', age: 40 },
		{ firstName: 'joe', lastName: 'dirte', age: 45 }
	]);

	// 3. New in v9: declare which features this table uses (none yet)
	const features = tableFeatures({
		rowSortingFeature,
		sortedRowModel: createSortedRowModel(),
		sortFns
	});

	// 4. Define your columns
	const columns: Array<ColumnDef<typeof features, Person>> = [
		{
			accessorKey: 'firstName', // accessorKey shorthand
			header: 'First Name',
			cell: (info) => info.getValue()
		},
		{
			accessorFn: (row) => row.lastName, // accessorFn alternative with a custom id
			id: 'lastName',
			header: () => 'Last Name',
			cell: (info) => info.getValue()
		},
		{
			accessorKey: 'age',
			header: () => 'Age'
		}
	];

	// 5. Create the table instance
	const table = createTable({
		features,
		columns,
		get data() {
			return data; // a getter keeps the table in sync with the $state rune
		}
	});
</script>

<PageHeader pageTitle="Reports">
	<div>Hi!!!</div>
</PageHeader>

<div class="flex flex-col gap-2">
	<PageHeader pageTitle="">
		<div>
			<BaseButton palette="mocha">
				<CreateIcon class="h-6" />
				Create New Report
			</BaseButton>
		</div>
	</PageHeader>

	<!-- 6. Render markup from the table instance APIs -->
	<div class="w-full rounded-xl border border-mocha p-4">
		<table class="w-full">
			<thead>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<tr>
						{#each headerGroup.headers as header (header.id)}
							<th>
								{#if !header.isPlaceholder}
									<button
										disabled={!header.column.getCanSort()}
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender {header} />

										
										{#if header.column.getIsSorted() === 'asc'}
											🔼
										{:else if header.column.getIsSorted() === 'desc'}
											🔽
										{/if}
									</button>
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.getRowModel().rows as row (row.id)}
					<tr>
						{#each row.getAllCells() as cell (cell.id)}
							<td>
								<FlexRender {cell} />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

Hi!!!
