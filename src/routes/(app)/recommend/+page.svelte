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
<PageHeader pageTitle="Recommend" description="Get a recommendation for reusing your SCG">
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

	<h1 class="text-xl font-medium">Moisture Condition</h1>
	<FormSelect>
		<option>Wet</option>
		<option>Damp</option>
		<option>Slightly Moist</option>
		<option>Dry</option>
	</FormSelect>

	<h1 class="text-xl font-medium">SCG Amount</h1>
	<FormInput id="scg_amount"></FormInput>

	<h1 class="text-xl font-medium">Storage Duration</h1>
	<FormSelect>
		<option>Freshly Collected</option>
		<option>Stored for a Few Hours</option>
		<option>Stored for 1-2 Days</option>
		<option>Stored for longer</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Visible Contamination</h1>
	<input type="checkbox" id="vehicle1" name="vehicle1" value="Bike" />
	<label for="vehicle1"> No Contamination</label><br />
	<input type="checkbox" id="vehicle2" name="vehicle2" value="Car" />
	<label for="vehicle2"> Mold</label><br />
	<input type="checkbox" id="vehicle3" name="vehicle3" value="Boat" />
	<label for="vehicle3"> Foreign Materials</label><br />
	<input type="checkbox" id="vehicle4" name="vehicle4" value="Boat" />
	<label for="vehicle4"> Unsure</label><br />

	<h1 class="text-xl font-medium">Processing State</h1>
	<FormSelect>
		<option>Raw</option>
		<option>Dried</option>
		<option>Composted</option>
		<option>Thermally Processed</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Drying Condition</h1>
	<FormSelect>
		<option>Not Dried</option>
		<option>Air-Dried</option>
		<option>Oven-Dried</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Composting Status</h1>
	<FormSelect>
		<option>Not Composted</option>
		<option>Currently Composting</option>
		<option>Composting</option>
		<option>Fully Composted</option>
	</FormSelect>

	<h1 class="text-xl font-medium">Materials Mixed in</h1>
	<input type="checkbox" id="mat1" name="mat1" value="Bike" />
	<label for="mat1"> Soil</label><br />
	<input type="checkbox" id="mat2" name="mat2" value="Car" />
	<label for="mat2"> Peat Moss</label><br />
	<input type="checkbox" id="mat3" name="mat3" value="Boat" />
	<label for="mat3"> Manure</label><br />
	<input type="checkbox" id="mat4" name="mat4" value="Boat" />
	<label for="mat4"> Paper Pulp</label><br />
	<input type="checkbox" id="mat5" name="mat5" value="Boat" />
	<label for="mat5"> Sawdust</label><br />

	<h1 class="text-xl font-medium">Available Equipment</h1>
	<input type="checkbox" id="eq1" name="eq1" value="Bike" />
	<label for="eq1"> Sunlight</label><br />
	<input type="checkbox" id="eq2" name="eq2" value="Car" />
	<label for="eq2"> Oven</label><br />
	<input type="checkbox" id="eq3" name="eq3" value="Boat" />
	<label for="eq3"> Grinder</label><br />
	<input type="checkbox" id="eq4" name="eq4" value="Boat" />
	<label for="eq4"> Blender</label><br />
</form>
