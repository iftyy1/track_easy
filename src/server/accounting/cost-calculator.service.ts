import { db } from '@/server/db';
import { materialPurchases } from '@/server/db/schema/accounting';
import { eq } from 'drizzle-orm';

export async function getWeightedAverageCost(materialId: string): Promise<number> {
    // Fetch all purchases for this material
    const purchases = await db
        .select({
            quantity: materialPurchases.quantity,
            totalCost: materialPurchases.totalCost,
        })
        .from(materialPurchases)
        .where(eq(materialPurchases.materialId, materialId));

    if (purchases.length === 0) {
        return 0;
    }

    let totalQuantity = 0;
    let totalSpent = 0;

    for (const purchase of purchases) {
        const qty = parseFloat(purchase.quantity?.toString() || '0');
        const cost = parseFloat(purchase.totalCost?.toString() || '0');
        totalQuantity += qty;
        totalSpent += cost;
    }

    if (totalQuantity === 0) {
        return 0;
    }

    return totalSpent / totalQuantity;
}

export interface BatchCostInput {
    quantityProduced: number;
    laborCost: number;
    overheadCost: number;
    materialsUsed: {
        materialId: string;
        quantityUsed: number;
    }[];
}

export interface BatchCostResult {
    totalBatchCost: number;
    unitCost: number;
    materialCost: number;
}

export async function calculateBatchCost(input: BatchCostInput): Promise<BatchCostResult> {
    let totalMaterialCost = 0;

    for (const material of input.materialsUsed) {
        const avgCost = await getWeightedAverageCost(material.materialId);
        totalMaterialCost += avgCost * material.quantityUsed;
    }

    const totalBatchCost =
        totalMaterialCost + input.laborCost + input.overheadCost;

    const unitCost =
        input.quantityProduced > 0 ? totalBatchCost / input.quantityProduced : 0;

    return {
        totalBatchCost,
        unitCost,
        materialCost: totalMaterialCost,
    };
}
