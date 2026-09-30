import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
