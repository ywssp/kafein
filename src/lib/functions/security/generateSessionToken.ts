import { setUserSessionToken } from "$lib/db/authentication";

export async function generateSessionToken(userId: number): Promise<string> {
  const tokenArr = crypto.getRandomValues(new Uint8Array(32));

  let token = '';
  for (const byte of tokenArr) {
    token += byte.toString(16).padStart(2, '0');
  }

  await setUserSessionToken(userId, token);

  return token;
}