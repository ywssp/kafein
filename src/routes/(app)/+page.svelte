<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';

	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import { colors } from '$lib/colors';
	import PageHeader from '$lib/components/text/PageHeader.svelte';

	function generateData() {
    let rolling = 50;
    let velocity = 0;
	
    return d3.range(100).map((d) => {
        // Small acceleration nudge
        velocity += (Math.random() - 0.5) * 0.2; 
        velocity *= 0.95; // Friction to keep momentum under control
        rolling += velocity;
	
        return { x: d, y: rolling };
    });
	}
</script>

<div class="flex flex-col gap-4">
	<PageHeader pageTitle="Home">
		<BaseButton palette="caramel">
			<CloudRefreshIcon class="h-6" />
			Refetch Sensor Data
		</BaseButton>
	</PageHeader>

	<h1 class="text-4xl">Demo Graph</h1>

	<div class="flex flex-row gap-4">
		<div class="bg-navy/25 p-2 rounded-md border-navy border-2">
			<h2 class="font-semibold text-navy text-2xl">Humidity</h2>
			<Plot>
				<Line
					x="x"
					y="y"
					data={generateData()}
					stroke={colors.navy}
					strokeWidth={4}
				/>
			</Plot>
		</div>

		<div class="bg-berry/25 p-2 rounded-md border-berry border-2">
			<h2 class="font-semibold text-berry text-2xl">Temperature</h2>
			<Plot>
				<Line
					x="x"
					y="y"
					data={generateData()}
					stroke={colors.berry}
					strokeWidth={4}
				/>
			</Plot>
		</div>
		<div class="bg-matcha/25 p-2 rounded-md border-matcha border-2">
			<h2 class="font-semibold text-matcha text-2xl">TVOC</h2>
			<Plot>
				<Line
					x="x"
					y="y"
					data={generateData()}
					stroke={colors.matcha}
					strokeWidth={4}
				/>
			</Plot>
		</div>
	</div>
	
	Dummy Data only!

	<div class="flex flex-col gap-4">
		<h1 class="mb-6 text-4xl font-bold text-ground">Color Tests</h1>

		<!-- Accent Colors Row -->
		<h2 class="mb-6 text-2xl font-bold text-ground">Accent Colors</h2>
		<div class="mb-4 flex flex-wrap gap-4">
			<BaseButton palette="berry">Berry</BaseButton>
			<BaseButton palette="spice">Spice</BaseButton>
			<BaseButton palette="caramel">Caramel</BaseButton>
			<BaseButton palette="matcha">Matcha</BaseButton>
			<BaseButton palette="navy">Navy</BaseButton>
			<BaseButton palette="lavender">Lavender</BaseButton>
		</div>

		<!-- Base & Neutral Colors Row -->
		<h2 class="mb-6 text-2xl font-bold text-ground">Dark Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="ground">Ground</BaseButton>
			<BaseButton palette="espresso">Espresso</BaseButton>
			<BaseButton palette="hazelnut">Hazelnut</BaseButton>
			<BaseButton palette="mocha">Mocha</BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Light Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="almond">Almond</BaseButton>
			<BaseButton palette="oat">Oat</BaseButton>
			<BaseButton palette="cream">Cream</BaseButton>
			<BaseButton palette="milk">Milk</BaseButton>
		</div>

		<h2 class="mb-6 text-2xl font-bold text-ground">Neutral Colors</h2>
		<div class="flex flex-wrap gap-4">
			<BaseButton palette="slate">Slate</BaseButton>
		</div>
	</div>
</div>
