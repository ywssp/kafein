import type { PageServerLoad } from './$types';
import { db  } from '$lib/server/db/index';
import { sensorData } from '$lib/server/db/schema';
import { desc, gte } from 'drizzle-orm';


export const load: PageServerLoad = async () => {
  // Fetch the records from the last hour

  const current_unix = Math.floor(Date.now() / 1000);
  const oneHourAgo = BigInt(current_unix - (60*60*12));
  
    const records = await db.select()
      .from(sensorData)
      .where(gte(sensorData.timestamp_unix, oneHourAgo))
      .orderBy(desc(sensorData.timestamp_unix));
  
    // Convert BigInt to Number so SvelteKit can safely serialize it to the frontend
    const serializedRecords = records.map(row => ({
      ...row,
      timestamp_unix: Number(row.timestamp_unix)
    }));
  
    return { records: serializedRecords };
};