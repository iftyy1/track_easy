// db/schema.ts
import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  productName: varchar('product_name', { length: 255 }),
  status: varchar('status', { length: 20 }).default('Processing'),
});
