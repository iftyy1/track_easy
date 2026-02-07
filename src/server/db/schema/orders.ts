import { pgTable, uuid, varchar, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  orderNumber: integer('order_number').notNull(),
  shareableLink: varchar('shareable_link', { length: 21 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  productName: varchar('product_name', { length: 255 }),
  status: varchar('status', { length: 20 }).default('Processing'),
  price: decimal('price', { precision: 10, scale: 2 }),
  // Cost accounting fields
  unitCostSnapshot: decimal('unit_cost_snapshot', { precision: 12, scale: 4 }),
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }),
  profit: decimal('profit', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});
