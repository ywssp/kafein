<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		HTMLInputAttributes,
		HTMLTextareaAttributes,
		HTMLSelectAttributes
	} from 'svelte/elements';

	// Combine all three native element attribute sets for complete type safety
	type RestProps = HTMLInputAttributes & HTMLTextareaAttributes & HTMLSelectAttributes;

	interface Props extends RestProps {
		id: string;
		children?: Snippet;
		label?: string;
		component?: 'input' | 'textarea' | 'select';
		bgClass?: string;
		pdfMode?: boolean;
		inputClass?: string;
		labelClass?: string;
	}

	let {
		id,
		name = id,
		label = id.charAt(0).toUpperCase() + id.slice(1),
		type = 'text',
		value = $bindable(''),
		component = 'input',
		autocomplete = 'off',
		disabled = false,
		required = false,
		bgClass = 'bg-[#4a2e20]',
		class: className = '',
		pdfMode = false,
		inputClass = '',
		labelClass = 'mb-4 text-2xl font-semibold text-caramel',
		children,
		...restProps
	}: Props = $props();

	const isPassword = $derived(type === 'password');
	const isSelect = $derived(component === 'select');
	let showPassword = $state(false);
	let inputType = $derived(isPassword ? (showPassword ? 'text' : 'password') : type);

	// Consolidated common class configurations
	let baseInputClasses = $derived([
		'coffee-input w-full rounded-lg border-2 font-serif text-[1.05rem] p-3 outline-none transition-all duration-200',
		'placeholder:text-cream/40',
		disabled
			? 'border-[#5c3d2e]/50 bg-[#3d2519] text-cream/40 cursor-not-allowed'
			: `border-[#6e4833] text-cream hover:border-[#875940] focus:border-caramel focus:ring-2 focus:ring-caramel/20 ${bgClass}`,
		isPassword && 'pr-12',
		isSelect && 'pr-10',
		inputClass
	]);
</script>

<div class="block w-full {className}">
	{#if label}
		<label
			for={id}
			class={[
				'block select-none',
				labelClass,
				disabled && 'cursor-not-allowed opacity-60'
			]}
		>
			{label}
			{#if required}
				<span class="text-danger ml-0.5" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative w-full">
		{#if pdfMode}
			<div
				class={[
					'flex min-h-[3.25rem] w-full items-center rounded-lg border-2 border-[#6e4833] p-3 font-serif text-[1.05rem] text-cream',
					bgClass,
					inputClass
				]}
			>
				<span class="leading-normal">{value || ' '}</span>
			</div>
		{:else if component === 'textarea'}
			<textarea
				{id}
				{name}
				{disabled}
				{required}
				bind:value
				class={baseInputClasses}
				{...restProps}
			></textarea>
		{:else if isSelect}
			<select
				{id}
				{name}
				{disabled}
				{required}
				bind:value
				class={[baseInputClasses, 'cursor-pointer appearance-none']}
				{...restProps}
			>
				{@render children?.()}
			</select>
		{:else}
			<input
				{id}
				{name}
				type={inputType}
				{autocomplete}
				{disabled}
				{required}
				bind:value
				class={baseInputClasses}
				{...restProps}
			/>
		{/if}

		{#if isPassword}
			<div class="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
				<button
					type="button"
					title="{showPassword ? 'Hide' : 'Show'} password"
					aria-label="{showPassword ? 'Hide' : 'Show'} password"
					{disabled}
					class="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-cream/70 transition-transform outline-none hover:text-cream active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={(e) => {
						e.preventDefault();
						showPassword = !showPassword;
					}}
				>
					<span
						class="inline-block text-xl"
						class:icon-[mdi--eye-off]={showPassword}
						class:icon-[mdi--eye]={!showPassword}
					></span>
				</button>
			</div>
		{/if}

		{#if isSelect}
			<div class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center">
				<span class="icon-[mdi--chevron-down] text-xl text-cream/80"></span>
			</div>
		{/if}
	</div>

	{#if disabled && name && value}
		<input type="hidden" {name} {value} />
	{/if}
</div>

<style>
	/* Ensures native select dropdown options and number spinners match the dark coffee theme */
	.coffee-input {
		color-scheme: dark;
	}

	.coffee-input :global(option) {
		background-color: #4a2e20;
		color: #f5ebe6;
	}
</style>