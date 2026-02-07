import { pgTable, uuid, varchar, text, timestamp, decimal, date } from 'drizzle-orm/pg-core';

// Materials - Raw materials catalog
export const materials = pgTable('materials', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    currentStockQty: decimal('current_stock_qty', { precision: 12, scale: 4 }).default('0').notNull(),
    avgUnitCost: decimal('avg_unit_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Material Purchases - Purchase tracking
export const materialPurchases = pgTable('material_purchases', {
    id: uuid('id').defaultRandom().primaryKey(),
    materialId: uuid('material_id').notNull(),
    userId: uuid('user_id').notNull(),
    quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
    unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
    totalCost: decimal('total_cost', { precision: 12, scale: 2 }).notNull(),
    purchaseDate: date('purchase_date').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Material Ledger - Stock movement history (Bank statement for inventory)
export const materialLedger = pgTable('material_ledger', {
    id: uuid('id').defaultRandom().primaryKey(),
    materialId: uuid('material_id').notNull(),
    userId: uuid('user_id').notNull(),
    transactionType: varchar('transaction_type', { length: 50 }).notNull(), // PURCHASE, PRODUCTION_USE, ADJUSTMENT
    quantityIn: decimal('quantity_in', { precision: 12, scale: 4 }).default('0'),
    quantityOut: decimal('quantity_out', { precision: 12, scale: 4 }).default('0'),
    unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
    balanceQty: decimal('balance_qty', { precision: 12, scale: 4 }).notNull(),
    referenceId: uuid('reference_id'), // Link to purchase or production batch
    referenceType: varchar('reference_type', { length: 50 }), // 'PURCHASE', 'BATCH'
    createdAt: timestamp('created_at').defaultNow(),
});

// Production Batches - Manufacturing runs
export const productionBatches = pgTable('production_batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    productId: varchar('product_id', { length: 255 }).notNull(), // Product name/identifier (TODO: Link to finishedGoods)
    quantityProduced: decimal('quantity_produced', { precision: 12, scale: 4 }).notNull(),
    laborCost: decimal('labor_cost', { precision: 12, scale: 2 }).notNull(),
    overheadCost: decimal('overhead_cost', { precision: 12, scale: 2 }).notNull(),
    totalBatchCost: decimal('total_batch_cost', { precision: 12, scale: 2 }).notNull(),
    unitCost: decimal('unit_cost', { precision: 12, scale: 4 }).notNull(),
    productionDate: date('production_date').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Production Material Usage - Materials used per batch
export const productionMaterialUsage = pgTable('production_material_usage', {
    id: uuid('id').defaultRandom().primaryKey(),
    batchId: uuid('batch_id').notNull(),
    materialId: uuid('material_id').notNull(),
    quantityUsed: decimal('quantity_used', { precision: 12, scale: 4 }).notNull(),
});

// Finished Goods - Stock of ready-to-sell items
export const finishedGoods = pgTable('finished_goods', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    qtyAvailable: decimal('qty_available', { precision: 12, scale: 4 }).default('0').notNull(),
    unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).default('0').notNull(), // Weighted Average
    totalValue: decimal('total_value', { precision: 12, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Finished Goods Ledger - FG movement history
export const fgLedger = pgTable('fg_ledger', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').notNull(),
    userId: uuid('user_id').notNull(),
    transactionType: varchar('transaction_type', { length: 50 }).notNull(), // PRODUCTION, SALE, ADJUSTMENT
    quantityIn: decimal('quantity_in', { precision: 12, scale: 4 }).default('0'),
    quantityOut: decimal('quantity_out', { precision: 12, scale: 4 }).default('0'),
    unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
    balanceQty: decimal('balance_qty', { precision: 12, scale: 4 }).notNull(),
    referenceId: uuid('reference_id'), // Link to batch or order
    createdAt: timestamp('created_at').defaultNow(),
});

// COGS Records - Cost of Goods Sold tracking per order
export const cogsRecords = pgTable('cogs_records', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').notNull(), // Link to orders table
    productId: uuid('product_id').notNull(), // Link to finishedGoods
    quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
    unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
    totalCogs: decimal('total_cogs', { precision: 12, scale: 2 }).notNull(),
    date: date('date').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Journal Entries - Double-entry accounting records
export const journalEntries = pgTable('journal_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    date: date('date').notNull(),
    accountDebit: varchar('account_debit', { length: 255 }).notNull(), // e.g., 'Inventory', 'COGS'
    accountCredit: varchar('account_credit', { length: 255 }).notNull(), // e.g., 'Cash', 'Finished Goods'
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    referenceId: uuid('reference_id'), // Link to transaction source
    referenceType: varchar('reference_type', { length: 50 }), // 'PURCHASE', 'PRODUCTION', 'SALE'
    createdAt: timestamp('created_at').defaultNow(),
});
