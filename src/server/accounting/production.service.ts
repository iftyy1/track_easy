import { db } from '@/server/db';
import { productionBatches, productionMaterialUsage } from '@/server/db/schema/accounting';
import { calculateBatchCost, BatchCostInput } from './cost-calculator.service';
import { desc, eq, and } from 'drizzle-orm';

export interface CreateProductionBatchInput {
    userId: string;
    productId: string;
    quantityProduced: number;
    laborCost: number;
    overheadCost: number;
    productionDate: Date;
    materialsUsed: {
        materialId: string;
        quantityUsed: number;
    }[];
}

export async function createProductionBatch(input: CreateProductionBatchInput) {
    // 1. Calculate costs
    const costResult = await calculateBatchCost({
        quantityProduced: input.quantityProduced,
        laborCost: input.laborCost,
        overheadCost: input.overheadCost,
        materialsUsed: input.materialsUsed,
    });

    // 2. Insert Batch
    const [newBatch] = await db
        .insert(productionBatches)
        .values({
            userId: input.userId,
            productId: input.productId,
            quantityProduced: input.quantityProduced.toString(),
            laborCost: input.laborCost.toString(),
            overheadCost: input.overheadCost.toString(),
            totalBatchCost: costResult.totalBatchCost.toString(),
            unitCost: costResult.unitCost.toString(),
            productionDate: input.productionDate.toISOString(),
        })
        .returning();

    // 3. Insert Material Usage
    if (input.materialsUsed.length > 0) {
        await db.insert(productionMaterialUsage).values(
            input.materialsUsed.map((m) => ({
                batchId: newBatch.id,
                materialId: m.materialId,
                quantityUsed: m.quantityUsed.toString(),
            }))
        );
    }

    return newBatch;
}

export async function getProductionBatches(userId: string) {
    return await db
        .select()
        .from(productionBatches)
        .where(eq(productionBatches.userId, userId))
        .orderBy(desc(productionBatches.productionDate));
}

export async function getLatestBatchForProduct(userId: string, productId: string) {
    const result = await db
        .select()
        .from(productionBatches)
        .where(
            and(
                eq(productionBatches.userId, userId),
                eq(productionBatches.productId, productId)
            )
        )
        .orderBy(desc(productionBatches.productionDate))
        .limit(1);

    return result[0] || null;
}

export async function deleteProductionBatch(userId: string, batchId: string) {
    return await db.delete(productionBatches)
        .where(and(eq(productionBatches.id, batchId), eq(productionBatches.userId, userId)))
        .returning();
}
