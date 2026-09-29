<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    // 1. We extend standard button attributes so TS knows it accepts type, form, disabled, etc.
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
        class: className = '', // 2. Capture 'class' if passed from parent
        ...rest // 3. Gather all other standard HTML attributes
    }: Props = $props();

    const variantClasses = {
        primary: 'bg-button-accent text-white enabled:hover:bg-button-accent-hover',
        secondary: 'bg-gray-500 text-white enabled:hover:bg-gray-600',
        danger: 'bg-button-danger text-white enabled:hover:bg-button-danger-hover',
        success: 'bg-button-success text-white enabled:hover:bg-button-success-hover'
    };
</script>

<button
    {...rest}
    class="
    flex cursor-pointer items-center justify-center gap-1 rounded px-4 py-2 text-center font-serif transition-colors
    duration-200 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-400
        disabled:text-gray-600
    {colorOverride ?? variantClasses[variant]}
        {additionalClass}
        {className}
  "
>
    {@render children?.()}
</button>