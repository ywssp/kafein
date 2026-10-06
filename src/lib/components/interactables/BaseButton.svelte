<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    type Variant =
        | 'ground'
        | 'espresso'
        | 'hazelnut'
        | 'mocha'
        | 'milk'
        | 'cream'
        | 'oat'
        | 'almond'
        | 'slate'
        | 'berry'
        | 'spice'
        | 'caramel'
        | 'matcha'
        | 'navy'
        | 'lavender';

    const palettes: Record<Variant, string> = {
        ground: 'bg-ground text-milk hover:border-almond',
        espresso: 'bg-espresso text-milk hover:border-almond',
        hazelnut: 'bg-hazelnut text-milk hover:border-almond',
        mocha: 'bg-mocha text-milk hover:border-almond',
        milk: 'bg-milk text-ground hover:border-mocha',
        cream: 'bg-cream text-ground hover:border-mocha',
        oat: 'bg-oat text-ground hover:border-mocha',
        almond: 'bg-almond text-ground hover:border-mocha',
        slate: 'bg-slate text-milk hover:border-mocha',
        berry: 'bg-berry text-milk hover:border-almond',
        spice: 'bg-spice text-milk hover:border-almond',
        caramel: 'bg-caramel text-milk hover:border-mocha',
        matcha: 'bg-matcha text-milk hover:border-almond',
        navy: 'bg-navy text-milk hover:border-almond',
        lavender: 'bg-lavender text-milk hover:border-mocha'
    };

    interface Props extends HTMLButtonAttributes {
        children?: Snippet;
        palette?: Variant;
    }

    let {
        children,
        palette = 'ground',
        class: className = '',
        ...restProps
    }: Props = $props();
</script>

<button
    class={[
        palettes[palette],
        'flex items-center gap-1 rounded-md border-2 border-transparent px-4 py-2 transition',
        className
    ]}
    {...restProps}
>
    {@render children?.()}
</button>