import type { PageServerLoad } from './$types';
import { db,  } from '$lib/server/db/index';
import { sensorData } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';


export const load: PageServerLoad = async () => {
  // Fetch the latest 100 records, newest first
    const records = await db.select()
      .from(sensorData)
      .orderBy(desc(sensorData.timestamp_unix))
      .limit(100);
  
    // Convert BigInt to Number so SvelteKit can safely serialize it to the frontend
    const serializedRecords = records.map(row => ({
      ...row,
      timestamp_unix: Number(row.timestamp_unix)
    }));
  
    return { records: serializedRecords };
};