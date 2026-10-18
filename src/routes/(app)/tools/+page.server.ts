import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { sensorData } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Group sensor data by session_id to get a list of recording sessions
	const sessions = await db
		.select({
			session_id: sensorData.session_id,
			startTime: sql<bigint>`MIN(${sensorData.timestamp_unix})`,
			endTime: sql<bigint>`MAX(${sensorData.timestamp_unix})`,
			recordCount: sql<number>`COUNT(*)`
		})
		.from(sensorData)
		.groupBy(sensorData.session_id)
		.orderBy(desc(sql`MIN(${sensorData.timestamp_unix})`));

	// Convert BigInt timestamps to Numbers for safe frontend serialization
	const serializedSessions = sessions.map((session) => ({
		...session,
		startTime: Number(session.startTime),
		endTime: Number(session.endTime),
		session_id: session.session_id ?? BigInt(0)
	}));

	return { sessions: serializedSessions };
};
