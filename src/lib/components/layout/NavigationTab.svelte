<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { resolve } from '$app/paths';

	let {
		children,
		navCollapsed = false,
		label = '',
		href,
	}: { children: Snippet; navCollapsed?: boolean; label?: string; href: ReturnType<typeof resolve> } = $props();
</script>

<a class="flex items-center gap-1 p-2 rounded-md transition hover:bg-mocha" href={href}>
	<!-- Icon -->
	{@render children?.()}

	<!-- Label -->
	{#if !navCollapsed}
	  <span transition:slide={{ axis: 'x' }}>
			{label}
		</span>
	{/if}
</a>
