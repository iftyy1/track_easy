import { db } from '@/server/db';
import { materialPurchases } from '@/server/db/schema/accounting';
import { eq, desc } from 'drizzle-orm';

export interface CreatePurchaseInput {
    userId: string;
    materialId: string;
    quantity: number;
    totalCost: number;
    purchaseDate: Date;
}

export async function createPurchase(input: CreatePurchaseInput) {
    const [newPurchase] = await db
        .insert(materialPurchases)
        .values({
            userId: input.userId,
            materialId: input.materialId,
            quantity: input.quantity.toString(),
            totalCost: input.totalCost.toString(),
            purchaseDate: input.purchaseDate.toISOString(),
        })
        .returning();

    return newPurchase;
}

export async function getPurchasesByMaterial(userId: string, materialId: string) {
    return await db
        .select()
        .from(materialPurchases)
        .where(eq(materialPurchases.materialId, materialId))
        .orderBy(desc(materialPurchases.purchaseDate));
}

export async function getAllPurchases(userId: string) {
    return await db
        .select()
        .from(materialPurchases)
        .where(eq(materialPurchases.userId, userId))
        .orderBy(desc(materialPurchases.purchaseDate));
}
