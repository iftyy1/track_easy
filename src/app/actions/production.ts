'use server';

import { createProductionBatch, getProductionBatches } from '@/server/accounting/production.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// We'll accept a JSON string for complex nested data (materialsUsed) or expects client to pass an object directly if using bind
// For simplicity in MVP, we can assume a plain object is passed if called from a client component's transition,
// or we can parse FormData. Let's stick closer to the existing pattern but allow object input for complex structures.

export interface ProductionBatchState {
    success: boolean;
    error?: string;
    data?: any;
}

export async function createProductionBatchAction(data: {
    productId: string;
    quantityProduced: number;
    laborCost: number;
    overheadCost: number;
    productionDate: string;
    materialsUsed: { materialId: string; quantityUsed: number }[];
}): Promise<ProductionBatchState> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const result = await createProductionBatch({
            userId: session.user.id,
            productId: data.productId,
            quantityProduced: data.quantityProduced,
            laborCost: data.laborCost,
            overheadCost: data.overheadCost,
            productionDate: new Date(data.productionDate),
            materialsUsed: data.materialsUsed,
        });
        revalidatePath('/production');
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creating production batch:', error);
        return { success: false, error: 'Failed to create production batch' };
    }
}

export async function getProductionBatchesAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    return await getProductionBatches(session.user.id);
}

export async function deleteProductionBatchAction(batchId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await import('@/server/accounting/production.service').then(mod => mod.deleteProductionBatch(session.user.id, batchId));
        revalidatePath('/production');
        return { success: true };
    } catch (error) {
        console.error('Error deleting production batch:', error);
        return { success: false, error: 'Failed to delete production batch' };
    }
}
