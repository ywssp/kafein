<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		colorOverride?: string;
		additionalClass?: string;
		variant?: 'primary' | 'secondary' | 'danger' | 'success';
	}

	let {
		children,
		colorOverride,
		additionalClass = '',
		variant = 'primary',
		class: className = '', 
		...rest 
	}: Props = $props();

	const variantClasses = {
		primary:
			'border-[#d4a373] bg-[#d4a373] text-[#2b1810] enabled:hover:bg-[#e0b489] enabled:hover:border-[#e0b489]',
		secondary:
			'border-[#6e4833] bg-[#4a2e20] text-cream enabled:hover:bg-[#5c3a28] enabled:hover:border-[#875940]',
		danger:
			'border-[#8c3b32] bg-[#5e251f] text-cream enabled:hover:bg-[#752e27] enabled:hover:border-[#a84a40]',
		success:
			'border-[#4a7c59] bg-[#34593f] text-cream enabled:hover:bg-[#406e4e] enabled:hover:border-[#5c996e]'
	};
</script>

<button
	{...rest}
	class={[
		'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-6 py-2.5 text-center font-serif text-[1.05rem] font-semibold shadow-sm transition-all duration-200',
		'enabled:active:scale-[0.98]',
		'disabled:cursor-not-allowed disabled:border-[#5c3d2e]/40 disabled:bg-[#3d2519] disabled:text-cream/40 disabled:shadow-none',
		colorOverride ?? variantClasses[variant],
		additionalClass,
		className
	]}
>
	{@render children?.()}
</button>