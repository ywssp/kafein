<script lang="ts">
	import './../layout.css';

	// Logo Icons
	import CoffeeIcon from '@iconify-svelte/mdi/coffee';
	
	// Tab Icons
	import HomeIcon from '@iconify-svelte/mdi/home';
	import FileReportIcon from '@iconify-svelte/mdi/file-report';
	import HelpIcon from '@iconify-svelte/mdi/help';
	import UsersIcon from '@iconify-svelte/mdi/users';

	// Minimize Bar Icons
	import ArrowCollapseLeftIcon from '@iconify-svelte/mdi/arrow-collapse-left';
	import LogoutIcon from '@iconify-svelte/mdi/logout';

	let { children } = $props();

	let navCollapsed = false;
	
</script>

<!-- <svelte:head><link rel="icon" href={favicon} /></svelte:head> -->

<div
	class="flex min-h-screen flex-row overflow-x-hidden bg-hazelnut text-espresso not-only:font-sans"
>
	<!-- Navigation Bar -->
	<nav
		class="my-4 flex
		max-w-1/6 min-w-1/8 flex-col gap-4 rounded-r-lg
		bg-espresso
		p-4 text-milk"
	>
		<!-- Title -->
		<h1 class="flex items-center gap-2 align-top text-4xl font-bold"><CoffeeIcon class="h-10" /> KafeIn</h1>

		<!-- Tabs -->
		<div class="flex flex-col justify-start rounded-md bg-mocha p-2 text-2xl text-cream">
			<span class="flex items-center gap-1"><HomeIcon class="h-10 text-almond" /> Home</span>
			<span class="flex items-center gap-1"><FileReportIcon class="h-10 text-almond" /> Reports</span>
			<span class="flex items-center gap-1"><HelpIcon class="h-10 text-almond" /> Help</span>
			<span class="flex items-center gap-1"><UsersIcon class="h-10 text-almond" /> Users</span>
		</div>

		<!-- Spacer -->
		<div class="invisible h-full"></div>

		<!-- Minimize Bar -->
		<div class="flex justify-between">
			<!-- Log Out Button -->
			<button class="flex items-center gap-1 rounded-full  p-2 px-4">
				<LogoutIcon class="h-6" /> Log Out
			</button>

			<button class="w-fit p-2"> <ArrowCollapseLeftIcon class="h-6" /> </button>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="dashboard m-4 box-border w-full flex-1 rounded-xl bg-milk p-4">
		{@render children()}
	</main>
</div>
