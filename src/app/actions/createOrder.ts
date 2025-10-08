'use server';

import { db } from '../../server/db';
import { orders } from '../../server/db/schema/orders';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = data.get('name') as string;
  const address = data.get('address') as string;
  const phone = data.get('phone') as string;
  const productName = data.get('productName') as string;
  
  if (!name || !address || !phone || !productName) {
    throw new Error('All fields are required');
  }
  
  const shareableLink = nanoid(10);

  try {
    const [newOrder] = await db
      .insert(orders)
      .values({ 
        userId: session.user.id,
        name, 
        address, 
        phone, 
        productName, 
        shareableLink 
      })
      .returning();

    revalidatePath('/orders');
    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}
