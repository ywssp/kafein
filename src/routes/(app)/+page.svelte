<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';

	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
</script>

<div class="flex flex-col gap-4">
	<header class="flex items-center justify-between">
		<h1 class="text-4xl font-semibold">Home</h1>

		<BaseButton palette="caramel">
			<CloudRefreshIcon class="h-6" />
			Fetch Sensor Data
		</BaseButton>
	</header>

	<h1 class="text-4xl">Demo Graph</h1>
	Not Yet Implemented
	<Plot>
		<Line x="x" y="y" data={d3.range(50).map((d) => ({ x: d, y: Math.random() }))} stroke="#1e2a38" />
		<Line x="x" y="y" data={d3.range(50).map((d) => ({ x: d, y: Math.random() }))} stroke="#9e472a" />
		<Line x="x" y="y" data={d3.range(50).map((d) => ({ x: d, y: Math.random() }))} stroke="#5b7053" />
	</Plot>

	<div class="flex flex-col gap-4">
		<h1 class="mb-6 text-4xl font-bold text-ground">Color Tests</h1>

		<!-- Accent Colors Row -->
		<h2 class="mb-6 text-2xl font-bold text-ground">Accent Colors</h2>
		<div class="mb-4 flex flex-wrap gap-4">
			<BaseButton palette="berry"> Berry </BaseButton>
			<BaseButton palette="spice"> Spice </BaseButton>
			<BaseButton palette="caramel"> Caramel </BaseButton>
			<BaseButton palette="matcha"> Matcha </BaseButton>
			<BaseButton palette="navy"> Navy </BaseButton>
			<BaseButton palette="lavender"> Lavender </BaseButton>
		</div>

		<!-- Base & Neutral Colors Row -->
		<h2 class="mb-6 text-2xl font-bold text-ground">Dark Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="ground"> Ground </BaseButton>
			<BaseButton palette="espresso"> Espresso </BaseButton>
			<BaseButton palette="hazelnut"> Hazelnut </BaseButton>
			<BaseButton palette="mocha"> Mocha </BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Light Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="almond"> Almond </BaseButton>
			<BaseButton palette="oat"> Oat </BaseButton>
			<BaseButton palette="cream"> Cream </BaseButton>
			<BaseButton palette="milk"> Milk </BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Neutral Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="slate"> Slate </BaseButton>
		</div>
	</div>
</div>
