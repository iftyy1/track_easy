import { db } from '@/server/db';
import {
    materials, materialPurchases, materialLedger,
    productionBatches, productionMaterialUsage,
    finishedGoods, fgLedger, cogsRecords,
    journalEntries
} from '@/server/db/schema/accounting';
import { eq, sql, and } from 'drizzle-orm';

// Helper to get material details
export async function getMaterial(materialId: string) {
    const [material] = await db.select().from(materials).where(eq(materials.id, materialId));
    return material;
}

// 1. Purchase Flow
export async function recordPurchase(input: {
    userId: string;
    materialId: string;
    quantity: number;
    totalCost: number;
    purchaseDate: Date;
}) {
    return await db.transaction(async (tx) => {
        const quantity = Number(input.quantity);
        const totalCost = Number(input.totalCost);
        const unitCost = quantity > 0 ? totalCost / quantity : 0;

        // 1. Record Purchase
        const [purchase] = await tx.insert(materialPurchases).values({
            userId: input.userId,
            materialId: input.materialId,
            quantity: quantity.toString(),
            unitCost: unitCost.toFixed(2),
            totalCost: totalCost.toString(),
            purchaseDate: input.purchaseDate.toISOString(),
        }).returning();

        // 2. Update Material Stock & Avg Cost
        const [currentMaterial] = await tx.select().from(materials).where(eq(materials.id, input.materialId));

        if (!currentMaterial) throw new Error("Material not found");

        const currentQty = Number(currentMaterial.currentStockQty);
        const currentAvgCost = Number(currentMaterial.avgUnitCost);
        const currentTotalValue = currentQty * currentAvgCost;

        const newQty = currentQty + quantity;
        const newTotalValue = currentTotalValue + totalCost;
        const newAvgCost = newQty > 0 ? newTotalValue / newQty : 0;

        await tx.update(materials).set({
            currentStockQty: newQty.toFixed(4),
            avgUnitCost: newAvgCost.toFixed(2),
        }).where(eq(materials.id, input.materialId));

        // 3. Ledger Entry
        await tx.insert(materialLedger).values({
            userId: input.userId,
            materialId: input.materialId,
            transactionType: 'PURCHASE',
            quantityIn: quantity.toString(),
            quantityOut: '0',
            unitCost: unitCost.toFixed(2),
            balanceQty: newQty.toFixed(4),
            referenceId: purchase.id,
            referenceType: 'PURCHASE',
        });

        // 4. Journal Entries
        // Debit Inventory (Asset)
        await tx.insert(journalEntries).values({
            userId: input.userId,
            date: input.purchaseDate.toISOString(),
            accountDebit: 'Inventory (Raw Materials)',
            accountCredit: 'Cash / Payable',
            amount: totalCost.toString(),
            referenceId: purchase.id,
            referenceType: 'PURCHASE',
        });

        return purchase;
    });
}

// 2. Production Validation & Recording
export async function recordProduction(input: {
    userId: string;
    productId: string; // Name or ID of the product being produced
    quantityProduced: number;
    laborCost: number;
    overheadCost: number;
    productionDate: Date;
    materialsUsed: { materialId: string; quantityUsed: number }[];
}) {
    return await db.transaction(async (tx) => {
        // 1. Validate Stock
        for (const usage of input.materialsUsed) {
            const [mat] = await tx.select().from(materials).where(eq(materials.id, usage.materialId));
            if (!mat) throw new Error(`Material ${usage.materialId} not found`);

            if (Number(mat.currentStockQty) < usage.quantityUsed) {
                throw new Error(`Insufficient stock for ${mat.name}. Available: ${mat.currentStockQty}, Required: ${usage.quantityUsed}`);
            }
        }

        // 2. Calculate Costs
        let totalMaterialCost = 0;
        const materialCosts: { materialId: string; cost: number; unitCost: number }[] = [];

        for (const usage of input.materialsUsed) {
            const [mat] = await tx.select().from(materials).where(eq(materials.id, usage.materialId));
            const cost = usage.quantityUsed * Number(mat.avgUnitCost);
            totalMaterialCost += cost;
            materialCosts.push({
                materialId: usage.materialId,
                cost,
                unitCost: Number(mat.avgUnitCost)
            });
        }

        const totalProductionCost = totalMaterialCost + input.laborCost + input.overheadCost;
        const unitCost = input.quantityProduced > 0 ? totalProductionCost / input.quantityProduced : 0;

        // 3. Create Batch
        const [batch] = await tx.insert(productionBatches).values({
            userId: input.userId,
            productId: input.productId,
            quantityProduced: input.quantityProduced.toString(),
            laborCost: input.laborCost.toString(),
            overheadCost: input.overheadCost.toString(),
            totalBatchCost: totalProductionCost.toString(),
            unitCost: unitCost.toFixed(4),
            productionDate: input.productionDate.toISOString(),
        }).returning();

        // 4. Deduct Materials & Ledger
        for (const usage of input.materialsUsed) {
            const [mat] = await tx.select().from(materials).where(eq(materials.id, usage.materialId));
            const newQty = Number(mat.currentStockQty) - usage.quantityUsed;

            // Update Stock
            await tx.update(materials)
                .set({ currentStockQty: newQty.toFixed(4) })
                .where(eq(materials.id, usage.materialId));

            // Record Usage
            await tx.insert(productionMaterialUsage).values({
                batchId: batch.id,
                materialId: usage.materialId,
                quantityUsed: usage.quantityUsed.toString(),
            });

            // Ledger
            await tx.insert(materialLedger).values({
                userId: input.userId,
                materialId: usage.materialId,
                transactionType: 'PRODUCTION_USE',
                quantityIn: '0',
                quantityOut: usage.quantityUsed.toString(),
                unitCost: Number(mat.avgUnitCost).toFixed(2),
                balanceQty: newQty.toFixed(4),
                referenceId: batch.id,
                referenceType: 'BATCH',
            });
        }

        // 5. Update Finished Goods
        // Check if FG entry exists for this product name
        // Note: Ideally productId would be a UUID to a product table, but schema has it as varchar.
        // We'll check finishedGoods table by productName for now if productId is a name.
        // Or if inputs.productId is actually a UUID from `finishedGoods` table (if products were pre-defined).
        // For MVP, assuming productId in productionBatches is the Name or we look it up.
        // Let's assume input.productId maps to finishedGoods.productName or we create it.

        let [fg] = await tx.select().from(finishedGoods).where(
            and(
                eq(finishedGoods.userId, input.userId),
                eq(finishedGoods.productName, input.productId) // Assuming productId is the name
            )
        );

        if (!fg) {
            [fg] = await tx.insert(finishedGoods).values({
                userId: input.userId,
                productName: input.productId,
                qtyAvailable: '0',
                unitCost: '0',
                totalValue: '0',
            }).returning();
        }

        const currentFgQty = Number(fg.qtyAvailable);
        const currentFgTotalValue = Number(fg.totalValue);

        const newFgQty = currentFgQty + input.quantityProduced;
        const newFgTotalValue = currentFgTotalValue + totalProductionCost;
        const newFgUnitCost = newFgQty > 0 ? newFgTotalValue / newFgQty : 0;

        await tx.update(finishedGoods).set({
            qtyAvailable: newFgQty.toFixed(4),
            unitCost: newFgUnitCost.toFixed(2),
            totalValue: newFgTotalValue.toFixed(2),
        }).where(eq(finishedGoods.id, fg.id));

        // 6. FG Ledger
        await tx.insert(fgLedger).values({
            userId: input.userId,
            productId: fg.id,
            transactionType: 'PRODUCTION',
            quantityIn: input.quantityProduced.toString(),
            quantityOut: '0',
            unitCost: unitCost.toFixed(2), // Batch unit cost
            balanceQty: newFgQty.toFixed(4),
            referenceId: batch.id,
        });

        // 7. Journal Entries
        // Debit Finished Goods
        await tx.insert(journalEntries).values({
            userId: input.userId,
            date: input.productionDate.toISOString(),
            accountDebit: 'Finished Goods',
            accountCredit: 'Work In Progress (Contra)', // Or split directly
            amount: totalProductionCost.toString(),
            referenceId: batch.id,
            referenceType: 'PRODUCTION',
        });

        // Credit Raw Materials
        if (totalMaterialCost > 0) {
            await tx.insert(journalEntries).values({
                userId: input.userId,
                date: input.productionDate.toISOString(),
                accountDebit: 'Work In Progress',
                accountCredit: 'Inventory (Raw Materials)',
                amount: totalMaterialCost.toString(),
                referenceId: batch.id,
                referenceType: 'PRODUCTION',
            });
        }

        // Credit Labor & Overhead (Cash/Payable)
        if (input.laborCost + input.overheadCost > 0) {
            await tx.insert(journalEntries).values({
                userId: input.userId,
                date: input.productionDate.toISOString(),
                accountDebit: 'Work In Progress',
                accountCredit: 'Cash / Payables (Labor & Overhead)',
                amount: (input.laborCost + input.overheadCost).toString(),
                referenceId: batch.id,
                referenceType: 'PRODUCTION',
            });
        }

        return batch;
    });
}

// 3. Sales & COGS
export async function recordSale(input: {
    userId: string;
    orderId: string;
    date: Date;
    items: { productId: string; quantity: number }[]; // productId here is FG ID or Name?
}) {
    return await db.transaction(async (tx) => {
        let totalCOGS = 0;
        let totalRevenue = 0; // We might not know revenue here unless passed, but we need it for Journal.
        // Assuming Order has revenue, but let's calculate COGS first.

        for (const item of input.items) {
            // Find FG
            // Logic to find FG by ID. If input.productId is name, find by name.
            // Assuming input.productId is the UUID from finishedGoods table.
            let [fg] = await tx.select().from(finishedGoods).where(eq(finishedGoods.id, item.productId));

            if (!fg) throw new Error(`Product ${item.productId} not found in inventory`);

            const soldQty = item.quantity;
            const unitCost = Number(fg.unitCost);
            const cogs = soldQty * unitCost;
            totalCOGS += cogs;

            // Decrease Stock
            const newQty = Number(fg.qtyAvailable) - soldQty;
            const newTotalValue = Number(fg.totalValue) - cogs;

            await tx.update(finishedGoods).set({
                qtyAvailable: newQty.toFixed(4),
                totalValue: newTotalValue.toFixed(2),
            }).where(eq(finishedGoods.id, fg.id));

            // FG Ledger
            await tx.insert(fgLedger).values({
                userId: input.userId,
                productId: fg.id,
                transactionType: 'SALE',
                quantityIn: '0',
                quantityOut: soldQty.toString(),
                unitCost: unitCost.toFixed(2),
                balanceQty: newQty.toFixed(4),
                referenceId: input.orderId, // This needs to be UUID
            });

            // Record COGS
            await tx.insert(cogsRecords).values({
                orderId: input.orderId,
                productId: fg.id,
                quantity: soldQty.toString(),
                unitCost: unitCost.toFixed(2),
                totalCogs: cogs.toFixed(2),
                date: input.date.toISOString(),
            });
        }

        // Journal Entries
        // Debit COGS (Expense)
        await tx.insert(journalEntries).values({
            userId: input.userId,
            date: input.date.toISOString(),
            accountDebit: 'Cost of Goods Sold',
            accountCredit: 'Finished Goods',
            amount: totalCOGS.toString(),
            referenceId: input.orderId,
            referenceType: 'SALE',
        });

        // Revenue Entry is typically handled when Order is created/paid. 
        // But if we want to do it here, we need revenue amount.
        // The user request said: "Sales -> Debit Cash/AR, Credit Revenue".
        // This might be done in a separate "Record Payment" step or here if we have price.
    });
}
