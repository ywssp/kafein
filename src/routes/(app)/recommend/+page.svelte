<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FormInput from '$lib/components/interactables/FormInput.svelte';
	import FormSelect from '$lib/components/interactables/FormSelect.svelte';
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import { experimentStore, nextIds } from '$lib/dummyData/experimentStore';

	type Num = number | string | null;

	const ids = nextIds($experimentStore);

	let form = $state({
		name: '',
		experimentId: ids.experimentId,
		batchId: ids.batchId,
		initialMass: null as Num,
		preparation: 'Dried',
		notes: '',
		packageType: 'Shoebox',
		length: null as Num,
		width: null as Num,
		height: null as Num,
		duration: null as Num,
		interval: null as Num,
		sensorNode: 'ESP32-001'
	});
</script>

<!-- Page Content -->
<PageHeader pageTitle="Recommend">
	<div class="mr-auto ml-4 h-full text-cream">Get a recommendation for reusing your SCG</div>
</PageHeader>

<form class="overflow-hidden">
	<h1 class="text-xl font-medium">Coffee Blend</h1>
	<FormSelect>
		<option>Arabica</option>
		<option>Robusta</option>
		<option>Mixed</option>
		<option>Unknown</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Brewing Cycles</h1>
	<FormSelect>
		<option>1 Time</option>
		<option>2 Times</option>
		<option>3 Times</option>
		<option>More than 4 times</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Brewing Method</h1>
	<FormSelect>
		<option>Espresso</option>
		<option>Drip</option>
		<option>French Press</option>
		<option>Pour Over</option>
		<option>Not Indicated</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Ground Size</h1>
	<FormSelect>
		<option>Fine</option>
		<option>Medium</option>
		<option>Coarse</option>
		<option>Unsure</option>
	</FormSelect>
</form>
