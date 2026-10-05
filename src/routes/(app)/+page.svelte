<script lang="ts">
	import { Plot, Line } from 'svelteplot';
	import * as d3 from 'd3';
	import { slide } from 'svelte/transition';
	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import ArrowCollapseUpIcon from '@iconify-svelte/mdi/arrow-collapse-up';
	import ArrowCollapseDownIcon from '@iconify-svelte/mdi/arrow-collapse-down';

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

	function chartHeight(width: number) {
		return Math.max(140, Math.min(180, width * 0.22));
	}
	let expandedChart = $state<string | null>(null);
    let hoverTimer: ReturnType<typeof setTimeout>;
		function handleMouseEnter(chartId: string) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
            expandedChart = chartId;
        }, 10); 
    }
	function handleMouseLeave() {
        clearTimeout(hoverTimer);
        expandedChart = null; // Collapses the chart when mouse leaves
    }

	function getMinMax(data: { x: number; y: number }[]) {
		const min = d3.min(data, (d) => d.y) ?? 0;
		const max = d3.max(data, (d) => d.y) ?? 0;
		return { min, max };
	}

	const humidity = generateData();
	const temperature = generateData();
	const tvoc = generateData();
	const weight = generateData();
</script>

<div class="flex min-w-0 flex-col gap-4">
	<PageHeader pageTitle="Home">
		<BaseButton palette="caramel">
			<CloudRefreshIcon class="h-6" />
			Refetch Sensor Data
		</BaseButton>
	</PageHeader>

	<!-- Humidity Graph -->
	<div class="grid min-w-0 grid-cols-1 gap-4">
        <div class="min-w-0 rounded-md border-2 border-navy bg-navy/25 p-2"
             role="group"
             onmouseenter={() => handleMouseEnter('humidity')}
             onmouseleave={handleMouseLeave}>
            <div class="flex flex-row justify-between">
                <h2 class="text-2xl font-semibold text-navy">Humidity</h2>

            <div class="flex flex-row justify-between gap-2 rounded-md bg-navy p-1 px-2 text-milk">
                <div class="flex flex-col justify-between text-xs">
                    <div>
                        <ArrowCollapseUpIcon class="inline-block h-3" /> Max:
                        {Math.round(getMinMax(humidity).max)}%
                    </div>
                    <div>
                        <ArrowCollapseDownIcon class="inline-block h-3" /> Min:
                        {Math.round(getMinMax(humidity).min)}%
                    </div>
                </div>

                <h2 class=" text-xl font-semibold">{Math.round(humidity[humidity.length - 1].y)}%</h2>
            </div>
            </div>

            {#if expandedChart === 'humidity'}
						<hr class="my-2 border-t-2 border-navy/50" />
                <div transition:slide={{ duration: 300 }} class="overflow-hidden flex flex-col">
                    <Plot height={chartHeight}>
                        <Line x="x" y="y" data={humidity} stroke={colors.navy} strokeWidth={4} />
                    </Plot>
                </div>
            {/if}
        </div>

		<!-- Temperature Graph -->
        <div class="min-w-0 rounded-md border-2 border-berry bg-berry/25 p-2"
             role="group"
             onmouseenter={() => handleMouseEnter('temperature')}
             onmouseleave={handleMouseLeave}>
            <div class="flex flex-row justify-between">
                <h2 class="p-1 text-2xl font-semibold text-berry">Temperature</h2>

                <div class="flex flex-row justify-between gap-2 rounded-md bg-berry p-1 px-2 text-milk">
                    <div class="flex flex-col justify-between text-xs">
                        <div>
                            <ArrowCollapseUpIcon class="inline-block h-3" /> Max:
                            {Math.round(getMinMax(temperature).max)} °C
                        </div>
                        <div>
                            <ArrowCollapseDownIcon class="inline-block h-3" /> Min:
                            {Math.round(getMinMax(temperature).min)} °C
                        </div>
                    </div>

                    <h2 class=" text-xl font-semibold">{Math.round(temperature[temperature.length - 1].y)} °C</h2>
                </div>
            </div>

            {#if expandedChart === 'temperature'}
			<hr class="my-2 border-t-2 border-navy/50" />
                <div transition:slide={{ duration: 300 }} class="overflow-hidden flex flex-col">
                    <Plot height={chartHeight}>
                        <Line x="x" y="y" data={temperature} stroke={colors.berry} strokeWidth={4} />
                    </Plot>
                </div>
            {/if}
        </div>
    </div>

	<div class="grid min-w-0 grid-cols-1 gap-4">
        
        <!-- TVOC Graph -->
        <div class="min-w-0 rounded-md border-2 border-matcha bg-matcha/25 p-2"
            role="group"
            onmouseenter={() => handleMouseEnter('tvoc')}
            onmouseleave={handleMouseLeave}>
            
            <div class="flex flex-row justify-between">
                <h2 class="text-2xl font-semibold text-matcha">Total Volatile Organic Compounds (µg/m³)</h2>
                
                <div class="flex flex-row justify-between gap-2 rounded-md bg-matcha p-1 px-2 text-milk">
                    <div class="flex flex-col justify-between text-xs">
                        <div>
                            <ArrowCollapseUpIcon class="inline-block h-3" /> Max:
                            {Math.round(getMinMax(tvoc).max)} µg/m³
                        </div>
                        <div>
                            <ArrowCollapseDownIcon class="inline-block h-3" /> Min:
                            {Math.round(getMinMax(tvoc).min)} µg/m³
                        </div>
                    </div>
                    <h2 class=" text-xl font-semibold">{Math.round(tvoc[tvoc.length - 1].y)} µg/m³</h2>
                </div>
            </div>

            {#if expandedChart === 'tvoc'}  
                <div transition:slide={{ duration: 300 }} class="overflow-hidden flex flex-col">
                    <Plot height={chartHeight}>
                        <Line x="x" y="y" data={tvoc} stroke={colors.matcha} strokeWidth={4} />
                    </Plot>
                </div>
            {/if}
        </div>

        <!-- Load Cell Graph -->
        <div class="min-w-0 rounded-md border-2 border-caramel bg-caramel/25 p-2"
            role="group"
            onmouseenter={() => handleMouseEnter('weight')}
            onmouseleave={handleMouseLeave}>
            
            <div class="flex flex-row justify-between">
                <h2 class="text-2xl font-semibold text-caramel">Load Cell (g)</h2>
                
                <div class="flex flex-row justify-between gap-2 rounded-md bg-caramel p-1 px-2 text-milk">
                    <div class="flex flex-col justify-between text-xs">
                        <div>
                            <ArrowCollapseUpIcon class="inline-block h-3" /> Max:
                            {Math.round(getMinMax(weight).max)} g
                        </div>
                        <div>
                            <ArrowCollapseDownIcon class="inline-block h-3" /> Min:
                            {Math.round(getMinMax(weight).min)} g
                        </div>
                    </div>
                    <h2 class=" text-xl font-semibold">{Math.round(weight[weight.length - 1].y)} g</h2>
                </div>
            </div>

            {#if expandedChart === 'weight'}    
                <div transition:slide={{ duration: 300 }} class="overflow-hidden flex flex-col">
                    <Plot height={chartHeight}>
                        <Line x="x" y="y" data={weight} stroke={colors.caramel} strokeWidth={4} />
                    </Plot>
                </div>
            {/if}
        </div>
    </div>

	<hr class="my-8 border-solid border-t-4 border-milk" />

	<div class="invisible flex flex-col gap-4">
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
