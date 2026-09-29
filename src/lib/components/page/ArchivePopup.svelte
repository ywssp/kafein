<script lang="ts">
	let { children } = $props();

	let isPopupVisible = $state(true);
</script>


{#if isPopupVisible}
	<div
		class={[
			'fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-start bg-main/50 p-6 pt-18 text-white shadow-2xl transition-opacity',
			isPopupVisible ? 'opacity-100' : 'opacity-0'
		]}
		role="dialog"
		aria-modal="true"
		aria-label="Archive dialog"
	>
		<div class="flex w-120">
			<button
				class="flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-none bg-button-accent font-bold text-white hover:bg-button-accent-hover"
				aria-label="Close Archive Popup"
				onclick={() => (isPopupVisible = false)}
			>
				<span class="icon-[mdi--close]"></span>
			</button>
		</div>

		<div
			class="mt-4 max-h-40 w-120 flex-1 overflow-auto rounded-2xl bg-white/80
     p-6 text-sm leading-6 text-black backdrop-blur-sm"
		>
			{@render children()}
		</div>
	</div>
{/if}
