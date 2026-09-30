import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/index';
import { users } from '$lib/server/db/schema';


export const load: PageServerLoad = async () => {
	const result = await db.select().from(users);

	return { result };
};

export const actions: Actions = {
	search: async ({ request }) => {
    const formData = await request.formData();
		
    const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		if (!username || !password) {
      return;
		}

		const newUser = await db.insert(users).values({username, password, totpSecret: '', sessionToken: ''})

		return newUser;
	}
} satisfies Actions;
