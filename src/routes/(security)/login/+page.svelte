<script>
	import './../../layout.css';
	import { enhance } from '$app/forms';

	import FormInput from '$lib/components/interactables/FormInput.svelte';
	// import FormStatus from '$lib/components/text/FormStatus.svelte';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<div class="bg-espresso font-sans text-ground">
	<div class="flex h-dvh items-center justify-center">
		<div class="bg-milk  rounded-xl">
			<div class="text-6xl bg-caramel p-4 rounded-t-xl text-center text-milk font-medium">KafeIn</div>

			<div class="flex flex-col items-center gap-2 p-4">
				<div class="text-4xl">User Login</div>

				<form method="POST" class="mt-4 flex flex-col gap-4" use:enhance>
					<div class="flex flex-col gap-6">
						<FormInput
							id="username"
							type="text"
							bgClass="bg-[#e7eae5]"
							required
						/>

						<FormInput
							id="password"
							type="password"
							bgClass="bg-[#e7eae5]"
							autocomplete="current-password"
							required
						/>
					</div>

					<!-- Error Display -->
					<!-- <FormStatus message="Example Text" variant="error" /> -->

					<!-- Forgot Password Link -->
					<div class="mt-2 flex w-full flex-col gap-2 ">
						<div class="text-center">
						</div>

							<BaseButton palette="mocha" onclick={() => goto(resolve("/(app)"))}><span class="w-full text-xl">Log In</span></BaseButton>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>