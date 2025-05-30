import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('user'), // user/admin/etc.
    createdAt: timestamp('created_at').defaultNow(),
  });