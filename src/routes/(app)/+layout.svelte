<script lang="ts">
	import './../layout.css';

	import { fade } from 'svelte/transition';
	import { resolve } from '$app/paths';	

	// Logo Icons
	import CoffeeIcon from '@iconify-svelte/mdi/coffee';

	// Tab Icons
	import HomeIcon from '@iconify-svelte/mdi/home';
	import FileReportIcon from '@iconify-svelte/mdi/file-report';
	import HelpIcon from '@iconify-svelte/mdi/help';
	import UsersIcon from '@iconify-svelte/mdi/users';

	// Minimize Bar Icons
	import ArrowCollapseLeftIcon from '@iconify-svelte/mdi/arrow-collapse-left';
	import ArrowExpandRightIcon from '@iconify-svelte/mdi/arrow-expand-right';
	import UserCircleIcon from '@iconify-svelte/mdi/user-circle';
	// import LogoutIcon from '@iconify-svelte/mdi/logout';
	import NavigationTab from '$lib/components/layout/NavigationTab.svelte';

	let { children } = $props();

	let navCollapsed = $state(false);

	function toggleNav() {
		navCollapsed = !navCollapsed;
	}
</script>

<!-- <svelte:head><link rel="icon" href={favicon} /></svelte:head> -->

<div
	class="flex min-h-screen flex-row overflow-x-hidden bg-hazelnut text-espresso not-only:font-sans"
>
	<!-- Navigation Bar -->
	<nav
		class={[
			`flex
		w-64 flex-col gap-4 rounded-r-lg h-[calc(100vh-2rem)] fixed top-4 bottom-4 left-0 flex-none
		bg-espresso
		overflow-hidden
		p-4 text-milk transition-all`,
			(navCollapsed && 'max-w-16 items-center') || 'min-w-64'
		]}
	>
		<!-- Title -->
		<h1 class="flex items-center gap-2 align-top text-4xl font-bold">
			<CoffeeIcon class="h-10" />
			{#if !navCollapsed}
				<span transition:fade> KafeIn </span>
			{/if}
		</h1>

		<!-- Tabs -->
		<div class="flex flex-col justify-start gap-4 text-2xl  text-cream">
			<NavigationTab href={resolve("/(app)")} label="Home" {navCollapsed}
				><HomeIcon class="h-8 text-almond" /></NavigationTab
			>
			<NavigationTab href={resolve("/(app)/reports")} label="Reports" {navCollapsed}
				><FileReportIcon class="h-8 text-almond" /></NavigationTab
			>
			<NavigationTab href={resolve("/(app)/help")} label="Help" {navCollapsed}
				><HelpIcon class="h-8 text-almond" /></NavigationTab
			>
			<NavigationTab href={resolve("/(app)/users")} label="Users" {navCollapsed}
				><UsersIcon class="h-8 text-almond" /></NavigationTab
			>
			<NavigationTab href={resolve("/(app)/experiments")} label="Experiments" {navCollapsed}
				><FileReportIcon class="h-8 text-almond" /></NavigationTab
			>
		</div>

		<!-- Minimize Bar -->
		<div class={['mt-auto flex justify-between gap-4', navCollapsed && 'flex-col items-center']}>
			<!-- Log Out Button -->
			<button class="flex items-center gap-1 rounded-full">
				<UserCircleIcon class="h-10" />
				{#if !navCollapsed}
					<a transition:fade href={resolve("/(security)/login")}> Log Out </a>
				{/if}
			</button>

			<button class="w-fit rounded-md p-2 hover:bg-mocha" onclick={toggleNav}>
				{#if navCollapsed}
					<ArrowExpandRightIcon class="h-6" />
				{:else}
					<ArrowCollapseLeftIcon class="h-6" />
				{/if}
			</button>
		</div>
	</nav>

	<!-- Main Content -->
	<main class={['m-4 ml-20 flex-1 rounded-lg bg-milk p-4', !navCollapsed && 'ml-68']}>
		{@render children()}
	</main>
</div>
