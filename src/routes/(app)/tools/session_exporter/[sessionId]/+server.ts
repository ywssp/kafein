import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { sensorData } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const { sessionId } = params;

	// Fetch all records for the requested session
	const records = await db
		.select()
		.from(sensorData)
		.where(eq(sensorData.session_id, sessionId)
		);

	if (records.length === 0) {
		return new Response('Session not found', { status: 404 });
	}

	// Extract column headers from the first record object
	const headers = Object.keys(records[0]);

	// Build CSV rows
	const csvRows = [
		headers.join(','), // Header row
		...records.map((row) =>
			headers
				.map((field) => {
					const val = row[field as keyof typeof row];
					// Convert BigInt to Number and wrap strings safely if needed
					const formattedVal = typeof val === 'bigint' ? Number(val) : (val ?? '');
					return `"${String(formattedVal).replace(/"/g, '""')}"`;
				})
				.join(',')
		)
	];

	const csvContent = csvRows.join('\n');

	// Return response configured as a downloadable file
	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="recording-session-${sessionId}.csv"`
		}
	});
};
