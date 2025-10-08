// db/schema.ts
import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  shareableLink: varchar('shareable_link', { length: 21 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  productName: varchar('product_name', { length: 255 }),
  status: varchar('status', { length: 20 }).default('Processing'),
});
