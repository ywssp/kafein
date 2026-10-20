<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '$lib/components/text/PageHeader.svelte';

	const { data } = $props();

	const sessions = $derived(
		data.sessions.map((s) => ({
			...s,
			start_date: new Date(s.startTime * 1000),
			end_date: new Date(s.endTime * 1000)
		}))
	);

	let selectedSession = $state("");
</script>

<PageHeader pageTitle="Tools">
	<div></div>
</PageHeader>

<p>Session Exporter</p>
<select class="rounded-md border border-mocha bg-almond text-espresso" bind:value={selectedSession}>
	{#each sessions as session (session.session_id)}
		<option value={session.session_id}>
			ID "{session.session_id}",
			{session.recordCount} Records | {session.start_date.toLocaleString()}~{session.end_date.toLocaleString()}
		</option>
	{/each}
</select>

<a href={resolve(`/tools/session_exporter/${selectedSession}`)} download> Export CSV </a>
