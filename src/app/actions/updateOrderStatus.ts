'use server';

import { db } from '../../server/db';
import { orders } from '../../server/db/schema/orders';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await db
      .update(orders)
      .set({ status: newStatus })
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Order not found or unauthorized' };
    }

    revalidatePath('/orders');
    revalidatePath(`/order/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
