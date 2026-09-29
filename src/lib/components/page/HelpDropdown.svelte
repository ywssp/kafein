<script lang="ts">
	import { slide } from 'svelte/transition';

	let { title, children, fillHeader = false} = $props();

	let isOpen = $state(false);
</script>

<div class="flex flex-col gap-2">
	<button
		class={[`hover:bg-accent-hover flex  items-center
     rounded-xl bg-accent p-2 pr-4 text-left text-xl font-semibold text-white transition-colors`, fillHeader ? "w-full" : "w-fit"]}
		onclick={() => (isOpen = !isOpen)}
	>
		<span class={["icon-[mdi--arrow-down-drop] transition-transform text-4xl px-0", isOpen ? "-rotate-180" : ""]}></span>
		{title}
	</button>

	{#if isOpen}
		<div class="flex flex-col gap-4 mx-4 rounded-xl border-2 border-accent/75 p-4 text-md text-black" transition:slide>
			{@render children?.()}
		</div>
	{/if}
</div>
