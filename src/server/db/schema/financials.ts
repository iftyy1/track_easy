import { pgTable, uuid, varchar, text, decimal, date, timestamp } from 'drizzle-orm/pg-core';

export const expenses = pgTable('expenses', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(), // business_id mapped to userId for consistency with other tables
    category: text('category').notNull(), // rent, marketing, utilities
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    expenseDate: date('expense_date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const liabilities = pgTable('liabilities', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(), // loan, payable
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    liabilityDate: date('liability_date').notNull(), // Date recorded or due date? Prompt says "liability_date".
    createdAt: timestamp('created_at').defaultNow(),
});

export const assets = pgTable('assets', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    assetType: text('asset_type').notNull(), // cash, equipment, inventory
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    recordedDate: date('recorded_date').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
