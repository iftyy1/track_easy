'use server';

import { createMaterial, getMaterials } from '@/server/accounting/materials.service';
import { recordPurchase } from '@/server/accounting/inventory.service';
import { getAllPurchases } from '@/server/accounting/purchases.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createMaterialAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;

    if (!name || !unit) {
        return { success: false, error: 'Name and unit are required' };
    }

    try {
        await createMaterial({
            userId: session.user.id,
            name,
            unit,
        });
        revalidatePath('/materials');
        return { success: true };
    } catch (error) {
        console.error('Error creating material:', error);
        return { success: false, error: 'Failed to create material' };
    }
}

export async function createPurchaseAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const materialId = formData.get('materialId') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const totalCost = parseFloat(formData.get('totalCost') as string);
    const purchaseDate = formData.get('purchaseDate') as string;

    if (!materialId || isNaN(quantity) || isNaN(totalCost) || !purchaseDate) {
        return { success: false, error: 'Invalid input' };
    }

    try {
        await recordPurchase({
            userId: session.user.id,
            materialId,
            quantity,
            totalCost,
            purchaseDate: new Date(purchaseDate),
        });
        revalidatePath('/materials');
        revalidatePath('/dashboard/financials'); // Also revalidate financials as purchases affect COGS/Assets
        return { success: true };
    } catch (error) {
        console.error('Error creating purchase:', error);
        return { success: false, error: 'Failed to create purchase' };
    }
}

export async function getMaterialsAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    return await getMaterials(session.user.id);
}

export async function getPurchasesAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    return await getAllPurchases(session.user.id);
}

export async function deleteMaterialAction(materialId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await import('@/server/accounting/materials.service').then(mod => mod.deleteMaterial(session.user.id, materialId));
        revalidatePath('/materials');
        return { success: true };
    } catch (error) {
        console.error('Error deleting material:', error);
        return { success: false, error: 'Failed to delete material' };
    }
}
