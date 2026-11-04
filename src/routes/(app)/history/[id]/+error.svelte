<script lang="ts">
	import ArrowLeftIcon from '@iconify-svelte/mdi/arrow-left';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { get } from 'svelte/store';

	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
</script>

<div class="mx-auto max-w-xl px-6 py-16 text-center text-milk">
	<h1 class="mb-2 text-3xl font-bold">Recommendation not found</h1>
	<p class="mb-6 text-milk/70">No recommendation with ID “{page.params.id}” exists.</p>
	<BaseButton palette="caramel" onclick={() => goto(resolve('/(app)/history'))}>
		<ArrowLeftIcon class="h-5" /> Return to history
	</BaseButton>
</div>
