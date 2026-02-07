'use server';

import { db } from '../../server/db';
import { users } from '../../server/db/schema/auth-users';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/types/next-auth';

interface UpdateRoleResult {
    success: boolean;
    error: string | null;
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<UpdateRoleResult> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
    }

    if (session.user.id === userId) {
        return { success: false, error: 'Cannot change your own role' };
    }

    try {
        await db
            .update(users)
            .set({ role: newRole })
            .where(eq(users.id, userId));

        revalidatePath('/admin/users');
        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update role' };
    }
}
