<script lang="ts">
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import PageHeader from '$lib/components/text/PageHeader.svelte';

	import { Plot, BarX } from 'svelteplot';

	import CheckIcon from '@iconify-svelte/mdi/check-circle';
</script>

<PageHeader pageTitle="Record ID-001" description="View your previous recommendation">
	<BaseButton palette="berry">Delete Record</BaseButton>
</PageHeader>

<div class="mt-4 rounded-lg border border-almond bg-matcha/50 p-4">
	<h2 class="text-xl font-semibold">Recommendation</h2>

	The SCG batch should be used for<u>Fertilizing Plants or Mushrooms</u>.
</div>

<div class="mt-4 space-y-6 rounded-lg border border-almond bg-caramel/40 p-6">
	<h2 class="border-b border-almond/30 pb-3 text-xl font-semibold text-cream">Input Details</h2>

	<!-- Grid for Key-Value Parameters -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Coffee Blend</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Arabica</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Processing State</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Dried</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Moisture Condition</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Dry</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">
				Brewing Method & Cycles
			</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Drip (1 Time)</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Ground Size</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Fine</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Amount & Storage</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">
				1000 Grams <span class="text-xs font-normal opacity-75">(Stored for longer)</span>
			</p>
		</div>

		<div>
			<h3 class="text-xs font-medium tracking-wider text-almond uppercase">Composting Status</h3>
			<p class="mt-0.5 text-sm font-semibold text-cream">Not Composted</p>
		</div>
	</div>

	<!-- Section for Checklist/Multi-option Attributes -->
	<div class="grid grid-cols-1 gap-6 border-t border-almond/30 pt-4 md:grid-cols-3">
		<!-- Visible Contamination -->
		<div>
			<h3 class="mb-2 text-xs font-medium tracking-wider text-almond uppercase">
				Visible Contamination
			</h3>
			<ul class="space-y-1.5 text-sm text-cream">
				<li class="flex items-center gap-1.5 font-medium">
					<CheckIcon class="h-4 " />No Contamination
				</li>
				<li class="opacity-40">Mold</li>
				<li class="opacity-40">Foreign Materials</li>
			</ul>
		</div>

		<!-- Materials Mixed In -->
		<div>
			<h3 class="mb-2 text-xs font-medium tracking-wider text-almond uppercase">
				Materials Mixed In
			</h3>
			<ul class="space-y-1.5 text-sm text-cream">
				<li class="opacity-40">Soil</li>
				<li class="opacity-40">Peat Moss</li>
				<li class="opacity-40">Manure</li>
				<li class="opacity-40">Paper Pulp</li>
				<li class="opacity-40">Saw Dust</li>
			</ul>
		</div>

		<!-- Available Equipment -->
		<div>
			<h3 class="mb-2 text-xs font-medium tracking-wider text-almond uppercase">
				Available Equipment
			</h3>
			<ul class="space-y-1.5 text-sm text-cream">
				<li class="flex items-center gap-1.5 font-medium">
					<CheckIcon class="h-4" />Sunlight
				</li>
				<li class="flex items-center gap-1.5 font-medium">
					<CheckIcon class="h-4 " />Oven
				</li>
				<li class="opacity-40">Grinder</li>
				<li class="opacity-40">Blender</li>
			</ul>
		</div>
	</div>
</div>

<div class="mt-4 rounded-lg border border-almond bg-navy/50 p-4">
	<h2 class="text-xl font-semibold">System Interpretation</h2>
	
	<Plot>
		<BarX
			data={[
				{
					value: 80,
					label: 'Fertilizer'
				},
				{
					value: 20,
					label: 'Fuel'
				},
				{
					value: 10,
					label: 'Structrural'
				}
			]}
			x="value"
			y="label"
			data-sveltekit-noscroll
		/>
	</Plot>
</div>
