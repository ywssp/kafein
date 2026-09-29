<script lang="ts">
	let { children } = $props();

	let isHelpVisible = $state(false);
</script>

<button
	class="
  flex
  h-7.5
  w-7.5
  cursor-pointer
  items-center
  justify-center
  rounded-full
  border-none
  bg-button-accent
  font-bold
  text-white
  hover:bg-button-accent-hover"
	aria-label="Help"
	onclick={() => (isHelpVisible = !isHelpVisible)}
>
	<span class="icon-[mdi--help]"></span>
</button>

{#if isHelpVisible}
	<div
		class={[
			'fixed inset-0 z-50 flex h-screen w-screen flex-col bg-main/50 p-6 pt-18 text-white shadow-2xl transition-opacity',
			isHelpVisible ? 'opacity-100' : 'opacity-0'
		]}
		role="dialog"
		aria-modal="true"
		aria-label="Help dialog"
	>
			<button
				class="flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-none bg-button-accent font-bold text-white hover:bg-button-accent-hover"
				aria-label="Close Help"
				onclick={() => (isHelpVisible = false)}
			>
				<span class="icon-[mdi--close]"></span>
			</button>

			<div
				class="mt-4 flex-1 overflow-auto rounded-2xl bg-white/80
     p-6 text-sm leading-6 text-black backdrop-blur-sm"
			>
				{@render children()}
			</div>
	</div>
{/if}
