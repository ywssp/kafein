<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		pageTitle,
		description: description = '',
		children
	}: { pageTitle: string; description?: string; children?: Snippet } = $props();
</script>

<header class="flex items-center justify-between mb-4">
	<div class="flex flex-row items-center gap-2">
		<h1 class="text-4xl font-semibold">{pageTitle}</h1>
		{#if description.trim().length > 0}
			<p class="opacity-50">●</p>
		{/if}
		<h1 class="text-xl">{description}</h1>
	</div>

	{@render children?.()}
</header>
