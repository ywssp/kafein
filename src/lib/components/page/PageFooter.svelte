<script lang="ts">
	let { children  } = $props();
</script>

<footer class="flex items-center justify-end">
	{@render children?.()}
</footer>