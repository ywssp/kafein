import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const clientURL = env.DATABASE_URL;

export const db = drizzle(clientURL);
