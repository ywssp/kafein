import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { db } from '$lib/server/db/index';
import { sensorData } from '$lib/server/db/schema';

interface TelemetryPayload {
  session: number;
  timestamp: number;
  weight: number;
  weight_rate: number;
  temp: number;
  humidity: number;
  abs_humidity: number;
  abs_humidity_rate: number;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data: TelemetryPayload = await request.json();
    
    console.log('Received sensor telemetry:', data);

    await db.insert(sensorData).values({ 
      session_id: BigInt(data.session),
      timestamp_unix: BigInt(data.timestamp),
      temperature_c: data.temp,
      rel_humidity: data.humidity,
      weight: data.weight,
      weight_rate_min: data.weight_rate,
      abs_humidity: data.abs_humidity,
      abs_humidity_rate_min: data.abs_humidity_rate
    })

    // Return a success response back to the ESP32
    return json({ status: 'success', message: 'Data logged successfully' });
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return json({ status: 'error', message: 'Invalid JSON payload' }, { status: 400 });
  }
};
