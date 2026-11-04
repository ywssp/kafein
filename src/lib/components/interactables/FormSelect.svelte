
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';


  interface Props extends HTMLSelectAttributes {
      children?: Snippet;
  }
  
  let {
      children,
      class: className = '',
      ...restProps
  }: Props = $props();
  
</script>

<select class={["rounded border-almond bg-hazelnut text-milk", className]} {...restProps}>
  {@render children?.()}
</select>