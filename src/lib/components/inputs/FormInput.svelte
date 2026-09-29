<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

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
		bgClass = 'bg-white',
		class: className = '',
		pdfMode = false,
		inputClass = '',
		children,
		...restProps
	} = $props<{
		id: string;
		name?: string;
		label?: string;
		type?: HTMLInputTypeAttribute;
		value?: HTMLInputElement['value'];
		component?: 'input' | 'textarea' | 'select';
		autocomplete?: string;
		disabled?: boolean;
		required?: boolean;
		bgClass?: string;
		class?: string;
		pdfMode?: boolean;
		inputClass?: string;
		children?: Snippet;
		[key: string]: any;
	}>();

	const isPassword = $derived(type === 'password');
	const isSelect = $derived(component === 'select');
	let showPassword = $state(false);
	let inputType = $derived(isPassword ? (showPassword ? 'text' : 'password') : type);

	// Consolidated common class configurations
	let baseInputClasses = $derived(
		`peer w-full rounded-lg border-2 font-serif text-[1.05rem] p-3 outline-none transition-colors duration-300 not-focus:placeholder:text-transparent placeholder:text-grey-300` +
			(disabled
				? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
				: ['border-gray-900 text-gray-900 focus:border-button-accent', bgClass]) +
			` ${isPassword ? 'pr-12' : ''} ${inputClass}`
	);
</script>

<div class="relative block w-full {className}">
	{#if pdfMode}
		<div
			class="peer flex w-full items-center rounded-lg border-2 border-gray-900 p-3 font-serif text-[1.05rem] {bgClass} {inputClass}"
		>
			<span class="leading-normal text-gray-900">{value || ' '}</span>
		</div>
	{:else if component === 'textarea'}
		<textarea
			{id}
			{name}
			{disabled}
			{required}
			placeholder=" "
			bind:value
			class={baseInputClasses}
			{...restProps}
		></textarea>
	{:else if component === 'select'}
		<select
			{id}
			{name}
			{disabled}
			{required}
			bind:value
			class="{baseInputClasses} cursor-pointer appearance-none"
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
			placeholder=" "
			bind:value
			class={baseInputClasses}
			{...restProps}
		/>
	{/if}

	<label
		for={id}
		class={[
			`pointer-events-none absolute top-3.5 left-4 rounded-lg  px-1 font-serif text-[1.05rem] text-gray-900
           transition-all duration-300 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-sm
           peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm
           peer-disabled:cursor-not-allowed peer-disabled:bg-gray-100 peer-disabled:text-gray-500`,
			bgClass
		]}
	>
		{label}
		{#if required}
			<span class="text-danger" aria-hidden="true">*</span>
		{/if}
	</label>

	{#if isPassword}
		<div class="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
			<button
				type="button"
				title="{showPassword ? 'Hide' : 'Show'} password"
				aria-label="{showPassword ? 'Hide' : 'Show'} password"
				{disabled}
				class="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-gray-600 transition-transform outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
		<div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
			<span class="icon-[mdi--chevron-down] text-xl text-gray-600"></span>
		</div>
	{/if}

	{#if disabled && name && value}
		<input type="hidden" {name} {value} />
	{/if}
</div>
