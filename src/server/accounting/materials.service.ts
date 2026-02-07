import { db } from '@/server/db';
import { materials } from '@/server/db/schema/accounting';
import { eq, desc, and } from 'drizzle-orm';

export interface CreateMaterialInput {
    userId: string;
    name: string;
    unit: string;
}

export async function createMaterial(input: CreateMaterialInput) {
    const [newMaterial] = await db
        .insert(materials)
        .values({
            userId: input.userId,
            name: input.name,
            unit: input.unit,
        })
        .returning();

    return newMaterial;
}

export async function getMaterials(userId: string) {
    return await db
        .select()
        .from(materials)
        .where(eq(materials.userId, userId))
        .orderBy(desc(materials.createdAt));
}

export async function deleteMaterial(userId: string, materialId: string) {
    return await db.delete(materials)
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
        .returning();
}
