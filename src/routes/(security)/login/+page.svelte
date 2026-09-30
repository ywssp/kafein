<script>
	import './../../layout.css';
	import { enhance } from '$app/forms';

	import FormInput from '$lib/components/interactables/FormInput.svelte';
	import FormStatus from '$lib/components/text/FormStatus.svelte';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';
</script>

<div class="bg-espresso font-sans">
	<div class="flex h-dvh items-center justify-center">
		<div class="bg-milk p-4 rounded-xl">
			<div class="text-3xl">KafeIn</div>

			<div class="flex flex-col items-center gap-2">
				<div class="text-3xl">User Login</div>

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
					<FormStatus message="Example Text" variant="error" />

					<!-- Forgot Password Link -->
					<div class="mt-2 flex w-full flex-col gap-2">
						<div class="text-center">
						</div>

						<div class="w-full">
							<BaseButton palette="mocha">Log In</BaseButton>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>