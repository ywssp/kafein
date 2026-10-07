<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		experimentStore,
		addActiveExperiment,
		nextIds,
		type Experiment
	} from '$lib/dummyData/experimentStore';

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

	let showConflictDialog = $state(false);

	const volume = $derived(
		isPositive(form.length) && isPositive(form.width) && isPositive(form.height)
			? ((Number(form.length) * Number(form.width) * Number(form.height)) / 1000).toFixed(2)
			: ''
	);

	const activeExperiment = $derived($experimentStore.find((e) => e.status === 'Active'));

	function isPositive(v: Num) {
		return v !== null && v !== '' && Number(v) > 0;
	}

	const missing = $derived(
		[
			!form.name.trim() && 'Experiment Name',
			!isPositive(form.initialMass) && 'Initial SCG Mass',
			!form.preparation && 'Preparation',
			!form.notes.trim() && 'Notes',
			!form.packageType && 'Package Type',
			!isPositive(form.length) && 'Length',
			!isPositive(form.width) && 'Width',
			!isPositive(form.height) && 'Height',
			!isPositive(form.duration) && 'Duration',
			!isPositive(form.interval) && 'Sampling Interval',
			!form.sensorNode && 'Sensor Node'
		].filter(Boolean) as string[]
	);
	const isComplete = $derived(missing.length === 0);

	function numericKeydown(e: KeyboardEvent) {
		if (e.key.length > 1 || e.metaKey || e.ctrlKey) return;
		if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
	}
	function stripLeadingZeros(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		el.value = el.value.replace(/^0+(?=\d)/, '');
	}
	function clampInterval(e: Event) {
		stripLeadingZeros(e);
		const el = e.currentTarget as HTMLInputElement;
		if (Number(el.value) > 60) {
			el.value = '60';
			form.interval = 60;
		}
	}

	function buildExperiment(): Experiment {
		return {
			id: form.experimentId,
			batch: form.batchId,
			package: form.packageType,
			start: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric'
			}),
			status: 'Active',
			name: form.name.trim(),
			initialMass: Number(form.initialMass),
			preparation: form.preparation,
			notes: form.notes.trim(),
			length: Number(form.length),
			width: Number(form.width),
			height: Number(form.height),
			volume: Number(volume),
			duration: Number(form.duration),
			interval: Number(form.interval),
			sensorNode: form.sensorNode
		};
	}

	function saveAndLeave() {
		addActiveExperiment(buildExperiment());
		showConflictDialog = false;
		goto(resolve('/(app)/reports'));
	}

	function handleContinue() {
		if (!isComplete) return;
		if (activeExperiment) {
			showConflictDialog = true;
			return;
		}
		saveAndLeave();
	}

	function cancelConflict() {
		showConflictDialog = false;
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && showConflictDialog && cancelConflict()} />

<div class="mx-auto w-full max-w-4xl p-8">
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-semibold text-white">Create New Experiment</h1>
		<p class="text-textMuted">Configure the physical parameters and sensor nodes.</p>
	</div>

	{#if activeExperiment}
		<div
			class="mb-6 rounded-md border border-caramel bg-[#3a2a26] px-4 py-3 text-sm text-textMain"
			role="status"
		>
			<span class="font-medium text-caramel">Heads up:</span>
			<span class="font-mono">{activeExperiment.id}</span> is currently active. Starting this experiment
			will pause it.
		</div>
	{/if}

	<form
		class="bg-panel border-borderClr overflow-hidden rounded-lg border shadow-md"
		onsubmit={(e) => e.preventDefault()}
	>
		<!-- Experiment Information -->
		<div class="border-borderClr border-b p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">Experiment Information</h3>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="md:col-span-2">
					<label for="name" class="text-textMuted mb-1 block text-sm font-medium"
						>Experiment Name</label
					>
					<input type="text" id="name" bind:value={form.name} 
					class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'/>
				</div>
				<div>
					<label for="expId" class="text-textMuted mb-1 block text-sm font-medium"
						>Experiment ID</label
					>
					<input
						type="text"
						id="expId"
						value={form.experimentId}
						class="border-borderClr bg-mainbg text-black block w-full cursor-not-allowed rounded-md border px-3 py-2 sm:text-sm"
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
						value={form.batchId}
						class="border-borderClr bg-mainbg text-textMuted block w-full cursor-not-allowed rounded-md border px-3 py-2 sm:text-sm"
						readonly
					/>
				</div>
			</div>
		</div>

		<!-- SCG Information -->
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
							id="mass"
							min="0"
							bind:value={form.initialMass}
							onkeydown={numericKeydown}
							oninput={stripLeadingZeros}
							class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'
						/>
						<span class="text-textMuted">g</span>
					</div>
				</div>
				<div>
					<label for="prep" class="text-textMuted mb-1 block text-sm font-medium">Preparation</label>
					<select id="prep" bind:value={form.preparation} 
					class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'>
						<option value="Dried">Dried</option>
						<option value="Undried">Undried</option>
					</select>
				</div>
				<div class="md:col-span-2">
					<label for="notes" class="text-textMuted mb-1 block text-sm font-medium">Notes</label>
					<textarea id="notes" 
					bind:value={form.notes} 
					rows="2" 
					class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'></textarea>
				</div>
			</div>
		</div>

		<!-- Packaging Information -->
		<div class="border-borderClr border-b p-6">
			<h3 class="mb-4 text-lg font-medium text-caramel">Packaging Information</h3>
			<div class="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="md:col-span-3">
					<label for="package" class="text-textMuted mb-1 block text-sm font-medium"
						>Package Type</label
					>
					<select id="package" 
					bind:value={form.packageType} 
					class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'>
						<option value="Shoebox">Shoebox</option>
						<option value="Pouch">Pouch</option>
						<option value="Crate">Crate</option>
					</select>
				</div>
				{#each [{ id: 'length', label: 'Length' }, { id: 'width', label: 'Width' }, { id: 'height', label: 'Height' }] as dim (dim.id)}
					<div>
						<label for={dim.id} class="text-textMuted mb-1 block text-sm font-medium"
							>{dim.label}</label
						>
						<div class="flex items-center space-x-2">
							<input
								type="number"
								id={dim.id}
								min="0"
								bind:value={form[dim.id as 'length' | 'width' | 'height']}
								onkeydown={numericKeydown}
								oninput={stripLeadingZeros}
								class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'
							/>
							<span class="text-textMuted">cm</span>
						</div>
					</div>
				{/each}
				<div class="md:col-span-3">
					<p class="text-textMuted text-sm">
						Calculated Volume: <span class="ml-2 font-mono text-white">{volume || '0.00'} L</span>
					</p>
				</div>
			</div>
		</div>

		<!-- Planned Experiment -->
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
							bind:value={form.duration}
							onkeydown={numericKeydown}
							oninput={stripLeadingZeros}
							class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'
						/>
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
							max="60"
							bind:value={form.interval}
							onkeydown={numericKeydown}
							oninput={clampInterval}
							class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'
						/>
						<span class="text-textMuted">minutes</span>
					</div>
				</div>
				<div>
					<label for="sensor" class="text-textMuted mb-1 block text-sm font-medium"
						>Sensor Node</label
					>
					<select id="sensor" 
					bind:value={form.sensorNode} 
					class='border-borderClr bg-mainbg text-black block w-full rounded-md border px-3 py-2 focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none sm:text-sm'>
						<option value="ESP32-001">ESP32-001</option>
						<option value="ESP32-002">ESP32-002</option>
						<option value="ESP32-003">ESP32-003</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="border-borderClr flex items-center justify-end gap-4 rounded-b-lg border-t bg-[#3a2a26] p-6">
			{#if !isComplete}
				<p class="text-textMuted mr-auto text-xs">
					Complete all fields to continue. Missing: {missing.join(', ')}
				</p>
			{/if}
			<button
				type="button"
				onclick={() => goto(resolve('/(app)/reports'))}
				class="rounded bg-caramel px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#a6652c]"
			>
				Back to List
			</button>
			<button
				type="button"
				onclick={handleContinue}
				disabled={!isComplete}
				class="rounded bg-caramel px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#a6652c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-caramel"
			>
				Continue to Setup
			</button>
		</div>
	</form>
</div>

<!-- Conflict dialog forda another experiment ongoing -->
{#if showConflictDialog && activeExperiment}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && cancelConflict()}
	>
		<div
			class="bg-panel border-borderClr w-full max-w-md rounded-lg border p-6 shadow-xl"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="conflict-title"
			aria-describedby="conflict-desc"
		>
			<h2 id="conflict-title" class="mb-2 text-lg font-semibold text-white">
				Another experiment is ongoing
			</h2>
			<p id="conflict-desc" class="text-textMuted mb-6 text-sm">
				<span class="font-mono text-white">{activeExperiment.id}</span>
				{#if activeExperiment.name}({activeExperiment.name}){/if} is currently active. Only one experiment
				can be active at a time. If you continue,
				<span class="font-mono text-white">{activeExperiment.id}</span> will be paused and
				<span class="font-mono text-white">{form.experimentId}</span> will be added as the active experiment.
			</p>
			<div class="flex justify-end gap-3">
				<button
					type="button"
					onclick={cancelConflict}
					class="border-borderClr text-textMain rounded border bg-transparent px-4 py-2 font-medium transition-colors hover:bg-[#4a3630]"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={saveAndLeave}
					class="rounded bg-caramel px-4 py-2 font-medium text-white transition-colors hover:bg-[#a6652c]"
				>
					Pause previous &amp; continue
				</button>
			</div>
		</div>
	</div>
{/if}