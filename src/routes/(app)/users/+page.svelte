<script lang="ts">
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import type { users } from '$lib/server/db/schema';

	type User = typeof users.$inferSelect;
	const { data } = $props();
	const usersList = $derived((data.result ?? []) as User[]);
</script>

<PageHeader pageTitle="Users">
	<div></div>
</PageHeader>

<form method="POST" action="?/search" class="flex items-stretch gap-2">
	<input
		type="text"
		name="username"
		class="min-w-80 rounded border border-gray-400 px-3 py-1.5 outline-none"
	/>

	<input
		type="text"
		name="password"
		class="min-w-80 rounded border border-gray-400 px-3 py-1.5 outline-none"
	/>

	<button type="submit">Create User</button>
</form>

<div class="w-full rounded-xl border border-mocha p-4">
	<table class="w-full border-collapse text-left">
		<thead>
			<tr class="border-b border-gray-300">
				<th class="px-3 py-2">ID</th>
				<th class="px-3 py-2">Username</th>
				<th class="px-3 py-2">Password</th>
				<th class="px-3 py-2">TOTP Secret</th>
				<th class="px-3 py-2">Session Token</th>
				<th class="px-3 py-2">Created At</th>
			</tr>
		</thead>
		<tbody>
			{#if usersList.length === 0}
				<tr>
					<td colspan="6" class="px-3 py-4 text-center text-gray-500">No users found.</td>
				</tr>
			{:else}
				{#each usersList as user (user.id)}
					<tr class="border-b border-gray-200 last:border-b-0">
						<td class="px-3 py-2">{user.id}</td>
						<td class="px-3 py-2">{user.username}</td>
						<td class="px-3 py-2">{user.password}</td>
						<td class="px-3 py-2">{user.totpSecret}</td>
						<td class="px-3 py-2">{user.sessionToken ?? '—'}</td>
						<td class="px-3 py-2">{user.createdAt}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
