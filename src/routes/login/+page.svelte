<script>
	import '../../layout.css';
	import Card from '$lib/components/StyledCard.svelte';
	import { enhance } from '$app/forms';

	import FormInput from '$lib/components/inputs/FormInput.svelte';
	import FormStatus from '$lib/components/page/FormStatus.svelte';
	import BasicButton from '$lib/components/inputs/BasicButton.svelte';

	let { form } = $props();
</script>

<div class="gradient-bg">
	<div class="flex h-dvh items-center justify-center">
		<Card>
			<div class="card-header">Sens Optical</div>

			<div class="flex flex-col items-center gap-2">
				<div class="font-serif text-3xl">User Login</div>

				<form method="POST" class="mt-4 flex flex-col gap-4" use:enhance>
					<div class="flex flex-col gap-6">
						<FormInput
							id="username"
							type="text"
							bgClass="bg-[#e7eae5]"
							required
							value={form?.username?.toString() || ''}
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
					<FormStatus message={form?.error} variant="error" />

					<!-- Forgot Password Link -->
					<div class="mt-2 flex w-full flex-col gap-2">
						<div class="text-center">
							<a
								href="/forgot_pass"
								class="decoration-none text-sm text-button-accent hover:underline"
							>
								Forgot password?
							</a>
						</div>

						<div class="w-full">
							<BasicButton type="submit" additionalClass="w-full">Log In</BasicButton>
						</div>
					</div>
				</form>
			</div>
		</Card>
	</div>
</div>

<!-- Styles -->
<style>
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.gradient-bg {
		width: 100vw;
		height: 100vh;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		background: linear-gradient(-45deg, #202a44, #4562a8, #3d5185);

		background-size: 400% 400%;
		animation: gradientMove 10s ease infinite;
	}

	@keyframes gradientMove {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.card-header {
		background-color: #4562a8;
		color: white;
		text-align: center;
		font-family: serif;
		font-size: 2.2rem;
		padding: 1rem 1rem;
		margin: -1rem -1rem 1rem -1rem;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}
</style>
