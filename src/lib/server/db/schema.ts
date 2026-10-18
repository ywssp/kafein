import { sqliteTable, text, real, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull(),
  password: text('password').notNull(),
  totpSecret: text('totpSecret').notNull(),
	sessionToken: text('sessionToken'),
	createdAt: text('createdAt')
		.$defaultFn(() => new Date().toISOString()),
});

export const sensorData = sqliteTable('sensor_data', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  session_id: blob('session_id', {
    mode: 'bigint'
  }),
  timestamp_unix: blob('timestamp_unix', {
    mode: 'bigint'
  }).notNull(),
  temperature_c: real('temperature_c').notNull(),
  rel_humidity: real('rel_humidity').notNull(),
  abs_humidity: real('abs_humidity').notNull(),
  abs_humidity_rate_min: real('abs_humidity_rate_min').notNull(),
  weight: real('weight').notNull(),
  weight_rate_min: real('weight_rate_min').notNull(),
})