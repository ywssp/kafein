<script lang="ts">
	import CloudRefreshIcon from '@iconify-svelte/mdi/cloud-refresh';
	import ClockIcon from '@iconify-svelte/mdi/clock';
	import AlertIcon from '@iconify-svelte/mdi/alert';
	import AddIcon from '@iconify-svelte/mdi/add';
	import FileChartIcon from '@iconify-svelte/mdi/file-chart';

	import { experimentStore } from '$lib/dummyData/experimentStore';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import DashboardGraph from '$lib/components/graphs/DashboardGraph.svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const experiment = $derived($experimentStore.find((e) => e.status === 'Active'));

	const { data } = $props();
</script>

<PageHeader pageTitle="Home">
	<div></div>
</PageHeader>
