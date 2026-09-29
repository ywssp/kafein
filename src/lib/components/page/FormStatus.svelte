
<script lang="ts">

const { message, variant = 'success' }: {
  message?: string;
  variant?: 'success' | 'error' | 'info';
} = $props();

const variantClasses = {
  success: 'border-success bg-success/10 text-success',
  error: 'border-danger bg-danger/10 text-danger',
  info: 'border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800'
};
</script>

{#if message}
	<div
		class={["mt-8 rounded-lg border-2 p-4 text-center text-sm", variantClasses[variant]]}
	>
		{message}
	</div>
{/if}