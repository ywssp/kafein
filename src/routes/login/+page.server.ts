import { verifyUserPassword } from '$lib/db/authentication';
import { generateSessionToken } from '$lib/functions/security/generateSessionToken';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();

		const username = data.get('username')?.toString().trim();
		const password = data.get('password')?.toString().trim();

		// Check Nullable Fields
		if (!username || !password) {
			return fail(400, {
				error: 'Please fill in all required fields.',
				username
			});
		}

		// Verify Password
		const userLoginAttempt = await verifyUserPassword(username, password);

		if (!userLoginAttempt.success || !userLoginAttempt.userId) {
			return fail(400, {
				error: 'Invalid username or password.',
				username
			});
		}

		let token: string;

		try {
			token = await generateSessionToken(userLoginAttempt.userId);
		} catch (error) {
			console.error('Error generating session token:', error);

			return fail(500, {
				error: 'An error occurred while generating user session token.',
				username
			});
		}

		cookies.set('session_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 // 1 day
		});

		return redirect(302, '/');
	}
} satisfies Actions;
