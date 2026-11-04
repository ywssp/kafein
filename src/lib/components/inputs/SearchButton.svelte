<script lang="ts">
	let { isFilled } = $props();
</script>

<button
	class={[
		'cursor-pointer rounded border-none px-4 py-2 text-base text-white transition-colors duration-200',
		isFilled
			? 'bg-button-accent hover:bg-button-accent-hover'
			: 'bg-button-alarm hover:bg-button-alarm-hover'
	]}
>
	{#if isFilled}
		Search
	{:else}
		View All
	{/if}
</button>
