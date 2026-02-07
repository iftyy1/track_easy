'use server';

import { db } from '../../server/db';
import { orders } from '../../server/db/schema/orders';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';

interface CreateOrderResult {
  success: boolean;
  error: string | null;
  data: { orderId: string } | null;
}

import { getLatestBatchForProduct } from '../../server/accounting/production.service';
import { calculateOrderProfit } from '../../server/accounting/profit.service';

export async function createOrder(data: FormData): Promise<CreateOrderResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', data: null };
  }

  const name = data.get('name') as string;
  const address = data.get('address') as string;
  const phone = data.get('phone') as string;
  const productName = data.get('productName') as string;
  const price = data.get('price') as string;

  if (!name || !address || !phone || !productName) {
    return { success: false, error: 'All fields are required', data: null };
  }

  const shareableLink = nanoid(10);

  try {
    // Cost & Profit Calculation
    const priceNum = parseFloat(price || '0');

    // 1. Fetch latest production batch
    const latestBatch = await getLatestBatchForProduct(session.user.id, productName);

    // 2. Snapshot cost and calculate profit
    // Defaulting to quantity 1 for now if not present in form
    // If unitCost is null (no batch found), profit fields will be null
    const unitCost = latestBatch ? parseFloat(latestBatch.unitCost?.toString() || '0') : null;

    const { unitCostSnapshot, totalCost, profit } = calculateOrderProfit(
      priceNum,
      1, // Assuming quantity 1 for MVP if not specified in form yet
      unitCost
    );

    // Get the highest order number for this user
    const lastOrder = await db
      .select({ orderNumber: orders.orderNumber })
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.orderNumber))
      .limit(1);

    const nextOrderNumber = lastOrder.length > 0 ? lastOrder[0].orderNumber + 1 : 1;

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        orderNumber: nextOrderNumber,
        name,
        address,
        phone,
        productName,
        price: price || '0',
        shareableLink,
        // Insert new accounting fields
        unitCostSnapshot: unitCostSnapshot?.toString(),
        totalCost: totalCost?.toString(),
        profit: profit?.toString(),
      })
      .returning();

    revalidatePath('/orders');
    revalidatePath('/dashboard');
    return { success: true, error: null, data: { orderId: newOrder.id } };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order', data: null };
  }
}
