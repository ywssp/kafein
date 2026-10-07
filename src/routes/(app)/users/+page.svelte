<script lang="ts">
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	import type { users } from '$lib/server/db/schema';

	type User = typeof users.$inferSelect;
	const { data } = $props();
	const usersList = $derived((data.result ?? []) as User[]);

	
</script>

<PageHeader pageTitle="Users">
	<div></div>
</PageHeader>

<form method="POST" action="?/search" class="flex gap-2 mb-2 border border-mocha bg-almond text-ground rounded-xl p-4 items-center">
  <label for="username">Username</label>
	<input
		type="text"
		name="username"
		class="rounded-md border border-mocha bg-cream  px-2 py-1 outline-none"
	/>

	<label for="password">Password</label>
	<input
		type="text"
		name="password"
		class="rounded-md border border-mocha bg-cream px-2 py-1 outline-none"
	/>

	<div class="mr-auto"> </div>
	<BaseButton type="submit" palette="matcha">Create User</BaseButton>
</form>

<div class="w-full rounded-xl border border-mocha p-4">
	<table class="w-full border-collapse text-left">
		<thead>
			<tr class="border-b border-gray-300">
				<th class="px-3 py-2">UUID</th>
				<th class="px-3 py-2">Username</th>
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
						<td class="px-3 py-2">{new Date(user.createdAt ?? '').toLocaleString()}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
