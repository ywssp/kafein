<script lang="ts">
    import type { Snippet } from 'svelte';

    let { title, children: searchDiv }: { title: string, children?: Snippet } = $props();
</script>

<header class="mb-4 flex items-center justify-between">
    <h1 class="m-0 font-serif text-2xl text-gray-800">
        {title}
    </h1>

    {#if searchDiv}
        {@render searchDiv()}
    {/if}
</header>