<script lang="ts">
  import type { Snippet } from "svelte";
  
	let {pageTitle, children} : { pageTitle: string; children: Snippet } = $props();
</script>

<header class="flex items-center justify-between">
		<h1 class="text-4xl font-semibold">{pageTitle}</h1>

		{@render children?.()}
	</header>