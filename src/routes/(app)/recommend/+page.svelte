<script lang="ts">
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import InputField from '$lib/components/inputs/FormInput.svelte';
	import BasicButton from '$lib/components/inputs/BasicButton.svelte';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	type Group = 'contamination' | 'materials' | 'equipment';

	const NO_CONTAMINATION = 'No Contamination';

	const coffeeBlends = ['Arabica', 'Robusta', 'Mixed', 'Unknown'];
	const brewingCycles = ['1 Time', '2 Times', '3 Times', 'More than 4 times'];
	const brewingMethods = ['Espresso', 'Drip', 'French Press', 'Pour Over', 'Not Indicated'];
	const groundSizes = ['Fine', 'Medium', 'Coarse', 'Unsure'];
	const moistureConditions = ['Wet', 'Damp', 'Slightly Moist', 'Dry'];
	const storageDurations = [
		'Freshly Collected',
		'Stored for a Few Hours',
		'Stored for 1-2 Days',
		'Stored for longer'
	];
	const processingStates = ['Raw', 'Dried', 'Composted', 'Thermally Processed'];
	const dryingConditions = ['Not Dried', 'Air-Dried', 'Oven-Dried'];
	const compostingStatuses = [
		'Not Composted',
		'Currently Composting',
		'Composting',
		'Fully Composted'
	];

	const contaminationOptions = [NO_CONTAMINATION, 'Mold', 'Foreign Materials', 'Unsure'];
	const materialOptions = ['Soil', 'Peat Moss', 'Manure', 'Paper Pulp', 'Sawdust'];
	const equipmentOptions = ['Sunlight', 'Oven', 'Grinder', 'Blender'];

	const defaults = () => ({
		coffeeBlend: coffeeBlends[0],
		brewingCycles: brewingCycles[0],
		brewingMethod: brewingMethods[0],
		groundSize: groundSizes[0],
		moistureCondition: moistureConditions[0],
		scgAmount: '' as string | number,
		storageDuration: storageDurations[0],
		processingState: processingStates[0],
		dryingCondition: dryingConditions[0],
		compostingStatus: compostingStatuses[0],
		contamination: [] as string[],
		materials: [] as string[],
		equipment: [] as string[]
	});

	let form = $state(defaults());
	function resolveContamination(selected: string[], changed: string) {
		if (!selected.includes(changed)) return selected;
		return changed === NO_CONTAMINATION
			? [NO_CONTAMINATION]
			: selected.filter((option) => option !== NO_CONTAMINATION);
	}

	function toggleOption(group: Group, option: string) {
		const selected = form[group].includes(option)
			? form[group].filter((item) => item !== option)
			: [...form[group], option];

		form[group] = group === 'contamination' ? resolveContamination(selected, option) : selected;
	}

	let isFormValid = $derived(Number(form.scgAmount) > 0 && form.contamination.length > 0);

	function resetForm() {
		form = defaults();
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!isFormValid) return;
	}
</script>

{#snippet checkGroup(label: string, group: Group, options: string[])}
	<div class="md:col-span-2">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">
			{label}
			{#if group === 'contamination'}
				<span class="text-danger ml-0.5" aria-hidden="true">*</span>
			{/if}
		</h2>
		<fieldset class="coffee-fieldset rounded-lg p-4">
			<legend class="sr-only">{label}</legend>
			<div class="flex flex-wrap gap-x-8 gap-y-2.5">
				{#each options as option (option)}
					<label class="coffee-check-label flex cursor-pointer items-center gap-2 text-cream">
						<input
							class="coffee-checkbox"
							type="checkbox"
							checked={form[group].includes(option)}
							onchange={() => toggleOption(group, option)}
						/>
						{option}
					</label>
				{/each}
			</div>
		</fieldset>
	</div>
{/snippet}

<!-- Page Content -->
<PageHeader
	pageTitle="Recommend"
	description="Get a recommendation for reusing your SCG"
></PageHeader>

<form onsubmit={handleSubmit} class="coffee-form mt-16 px-12 pb-12">
	<div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
		<InputField
			id="coffee_blend"
			label="Coffee Blend"
			component="select"
			required
			bind:value={form.coffeeBlend}
		>
			{#each coffeeBlends as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="brewing_cycles"
			label="Brewing Cycle"
			component="select"
			required
			bind:value={form.brewingCycles}
		>
			{#each brewingCycles as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="brewing_method"
			label="Brewing Method"
			component="select"
			required
			bind:value={form.brewingMethod}
		>
			{#each brewingMethods as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="ground_size"
			label="Ground Size"
			component="select"
			required
			bind:value={form.groundSize}
		>
			{#each groundSizes as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="moisture_condition"
			label="Moisture Condition"
			component="select"
			required
			bind:value={form.moistureCondition}
		>
			{#each moistureConditions as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="scg_amount"
			type="number"
			inputmode="numeric"
			label="SCG Amount"
			required
			min={0}
			step="1"
			placeholder="Enter amount (g)"
			bind:value={form.scgAmount}
			onkeydown={(e) => {
				if (['e', 'E', '+', '-'].includes(e.key)) {
					e.preventDefault();
				}
			}}
			oninput={(e) => {
				const target = e.currentTarget as HTMLInputElement;
				target.value = target.value.replace(/[^0-9.]/g, '');
				form.scgAmount = target.value;
			}}
		/>
		<InputField
			id="storage_duration"
			label="Storage Duration"
			component="select"
			required
			bind:value={form.storageDuration}
		>
			{#each storageDurations as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="processing_state"
			label="Processing State"
			component="select"
			required
			bind:value={form.processingState}
		>
			{#each processingStates as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="drying_condition"
			label="Drying Condition"
			component="select"
			required
			bind:value={form.dryingCondition}
		>
			{#each dryingConditions as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="composting_status"
			label="Composting Status"
			component="select"
			required
			bind:value={form.compostingStatus}
		>
			{#each compostingStatuses as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		{@render checkGroup('Visible Contamination', 'contamination', contaminationOptions)}
		{@render checkGroup('Materials Mixed in', 'materials', materialOptions)}
		{@render checkGroup('Available Equipment', 'equipment', equipmentOptions)}
	</div>

	<div class="mt-12 flex justify-between">
		<BaseButton onclick={resetForm} type="reset" palette="berry">Reset</BaseButton>
		<BaseButton type="submit" disabled={!isFormValid} palette="caramel"
			>Get Recommendation</BaseButton
		>
	</div>
</form>

<style>
	.coffee-form {
		margin: 0 auto;
	}

	.coffee-fieldset {
		background-color: #4a2e20;
		border: 2px solid #6e4833;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.coffee-fieldset:hover {
		border-color: #875940;
	}

	.coffee-fieldset:focus-within {
		border-color: #d4a373;
		box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.2);
	}

	.coffee-check-label {
		font-size: 1.05rem;
		user-select: none;
	}

	/* Custom-styled checkbox with a lighter coffee surface */
	.coffee-checkbox {
		appearance: none;
		-webkit-appearance: none;
		width: 1.15rem;
		height: 1.15rem;
		background-color: #5c3a28;
		border: 1.5px solid #8c6249;
		border-radius: 0.25rem;
		cursor: pointer;
		display: inline-grid;
		place-content: center;
		transition: all 0.15s ease;
	}

	.coffee-checkbox:hover {
		border-color: #d4a373;
		background-color: #69432f;
	}

	.coffee-checkbox:checked {
		background-color: #d4a373;
		border-color: #d4a373;
	}

	.coffee-checkbox:checked::before {
		content: '';
		width: 0.65rem;
		height: 0.65rem;
		transform: scale(1);
		background-color: #362016;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}
</style>
