<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	let form = $state({
		name: '',
		experimentId: 'EXP-2026-009',
		batchId: 'SCG-009',
		initialMass: '',
		preparation: 'Dried',
		notes: '',
		packageType: 'Shoebox',
		length: '',
		width: '',
		height: '',
		duration: '',
		interval: '',
		sensorNode: 'ESP32-001'
	});

	let volume = $derived(
		form.length && form.width && form.height
			? ((Number(form.length) * Number(form.width) * Number(form.height)) / 1000).toFixed(2)
			: ''
	);

	function handleSaveDraft() {
		console.log('Draft saved:', form);
	}

	function handleContinue() {
		console.log('Continuing to setup with data:', { ...form, volume });
	}
</script>

<!-- Form Container Centered -->
<div class="mx-auto w-full max-w-4xl p-8">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-semibold text-white">Create New Experiment</h1>
		<p class="text-textMuted">Configure the physical parameters and sensor nodes.</p>
	</div>

	<!-- Main Form Panel -->
	<form
		class="bg-panel border-borderClr overflow-hidden rounded-lg border shadow-md"
		onsubmit={(e) => e.preventDefault()}
	>
		<!-- 1. Experiment Information -->
		<div class="border-borderClr border-b p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">Experiment Information</h3>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="md:col-span-2">
					<label for="name" class="text-textMuted mb-1 block text-sm font-medium"
						>Experiment Name</label
					>
					<input
						type="text"
						id="name"
						bind:value={form.name}
						class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
					/>
				</div>
				<div>
					<label for="expId" class="text-textMuted mb-1 block text-sm font-medium"
						>Experiment ID</label
					>
					<input
						type="text"
						id="expId"
						bind:value={form.experimentId}
						class="border-borderClr bg-mainbg text-textMuted block w-full cursor-not-allowed rounded-md border px-3 py-2 sm:text-sm"
						readonly
					/>
				</div>
				<div>
					<label for="batchId" class="text-textMuted mb-1 block text-sm font-medium"
						>SCG Batch ID</label
					>
					<input
						type="text"
						id="batchId"
						bind:value={form.batchId}
						class="border-borderClr bg-mainbg text-textMuted block w-full cursor-not-allowed rounded-md border px-3 py-2 sm:text-sm"
						readonly
					/>
				</div>
			</div>
		</div>

		<!-- 2. SCG Information -->
		<div class="border-borderClr border-b p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">SCG Information</h3>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="mass" class="text-textMuted mb-1 block text-sm font-medium"
						>Initial SCG Mass</label
					>
					<div class="flex items-center space-x-2">
						<input
    					type="number"
    					id="duration"
						bind:value={form.initialMass}
    					min="0"
    					onkeydown={(e) => {
        				if (e.key.length > 1 || e.metaKey) return;
        				if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
						}}
							class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
						/>
						<span class="text-textMuted">g</span>
					</div>
				</div>
				<div>
					<label for="prep" class="text-textMuted mb-1 block text-sm font-medium">Preparation</label
					>
					<select
						id="prep"
						bind:value={form.preparation}
						class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
					>
						<option value="Dried">Dried</option>
						<option value="Undried">Undried</option>
					</select>
				</div>
				<div class="md:col-span-2">
					<label for="notes" class="text-textMuted mb-1 block text-sm font-medium">Notes</label>
					<textarea
						id="notes"
						bind:value={form.notes}
						rows="2"
						class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
					></textarea>
				</div>
			</div>
		</div>

		<!-- 3. Packaging Information -->
		<div class="border-borderClr border-b p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">Packaging Information</h3>
			<div class="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="md:col-span-3">
					<label for="package" class="text-textMuted mb-1 block text-sm font-medium"
						>Package Type</label
					>
					<select
						id="package"
						bind:value={form.packageType}
						class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm md:w-1/3"
					>
						<option value="Shoebox">Shoebox</option>
						<option value="Pouch">Pouch</option>
						<option value="Crate">Crate</option>
					</select>
				</div>
				<div>
					<label for="len" class="text-textMuted mb-1 block text-sm font-medium">Length</label>
					<div class="flex items-center space-x-2">
						<input
    					type="number"
    					id="length"
    					min="0"
						bind:value={form.length}
    					onkeydown={(e) => {
        				if (e.key.length > 1 || e.metaKey) return;
        				if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
						}}
							class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
						/>
						<span class="text-textMuted">cm</span>
					</div>
				</div>
				<div>
					<label for="width" class="text-textMuted mb-1 block text-sm font-medium">Width</label>
					<div class="flex items-center space-x-2">
						<input
							type="number"
							id="width"
							min="0"
							bind:value={form.width}
							onkeydown={(e) => {
        				if (e.key.length > 1 || e.metaKey) return;
        				if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
						}}
						oninput={(e) => {
								form.width = e.currentTarget.value.replace(/^0+(?=\d)/, '');
								}}
							class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
						/>
						<span class="text-textMuted">cm</span>
					</div>
				</div>
				<div>
					<label for="height" class="text-textMuted mb-1 block text-sm font-medium">Height</label>
					<div class="flex items-center space-x-2">
						<input
							type="number"
							id="height"
							min="0"
							bind:value={form.height}
							onkeydown={(e) => {
        				if (e.key.length > 1 || e.metaKey) return;
        				if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
						}}
						oninput={(e) => {
								form.width = e.currentTarget.value.replace(/^0+(?=\d)/, '');
								}}
							class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
						/>
						<span class="text-textMuted">cm</span>
					</div>
				</div>
				<div class="md:col-span-3">
					<p class="text-textMuted text-sm">
						Calculated Volume: <span class="ml-2 font-mono text-white">{volume || '0.00'} L</span>
					</p>
				</div>
			</div>
		</div>

		<!-- 4. Planned Experiment -->
		<div class="p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">Planned Experiment</h3>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="duration" class="text-textMuted mb-1 block text-sm font-medium"
						>Duration</label
					>
					<div class="flex items-center space-x-2">
						<input
    					type="number"
    					id="duration"
    					min="0"
    					onkeydown={(e) => {
        				if (e.key.length > 1 || e.metaKey) return;
        				if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
						}}
						oninput={(e) => {
								form.duration = e.currentTarget.value.replace(/^0+(?=\d)/, '');
								}}
    					bind:value={form.duration}
    					class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"/>
						<span class="text-textMuted">hours</span>
					</div>
				</div>
				<div>
					<label for="interval" class="text-textMuted mb-1 block text-sm font-medium"
						>Sampling Interval</label
					>
					<div class="flex items-center space-x-2">
						<input
							type="number"
							id="interval"
							min="0"
							onkeydown={(e) => {
								if (e.key.length > 1 || e.metaKey) return;
        						if (!/^[0-9.]$/.test(e.key)) {e.preventDefault();}
								}}
								oninput={(e) => {
								form.interval = e.currentTarget.value.replace(/^0+(?=\d)/, '');
        						if (Number(e.currentTarget.value) > 59) {
            					form.interval = '59';}
    							}}	
							bind:value={form.interval}
							class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
						/>
						<span class="text-textMuted">minutes</span>
					</div>
				</div>
				<div>
					<label for="sensor" class="text-textMuted mb-1 block text-sm font-medium"
						>Sensor Node</label
					>
					<select
						id="sensor"
						bind:value={form.sensorNode}
						class="border-borderClr bg-mainbg text-textMain block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm"
					>
						<option value="ESP32-001">ESP32-001</option>
						<option value="ESP32-002">ESP32-002</option>
						<option value="ESP32-003">ESP32-003</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Actions / Footer -->
		<div class="border-borderClr flex justify-end space-x-4 rounded-b-lg border-t bg-[#3a2a26] p-6">
			<!--
            <button type="button" onclick={handleSaveDraft} class="px-5 py-2.5 bg-transparent border border-borderClr text-textMain rounded shadow-sm font-medium hover:bg-[#4a3630] transition-colors">
                Save Draft
            </button>
            -->
			<button
				onclick={() => goto('/experiment_list')}
				class="flex items-center space-x-2 rounded bg-caramel px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#a6652c]"
			>
				<span>Back to List</span>
			</button>
			<button
				type="button"
				onclick={handleContinue}
				class="rounded bg-caramel px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#a6652c]"
			>
				Continue to Setup
			</button>
		</div>
	</form>
</div>
