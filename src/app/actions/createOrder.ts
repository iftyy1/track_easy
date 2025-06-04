'use server';

import { db } from '../../server/db';
import { orders } from '../../server/db/schema/orders';
import { redirect } from 'next/navigation';

export async function createOrder(data: FormData) {
  const name = data.get('name') as string;
  const address = data.get('address') as string;
  const phone = data.get('phone') as string;
  const productName = data.get('productName') as string;

  const [newOrder] = await db
    .insert(orders)
    .values({ name, address, phone, productName })
    .returning();

  redirect(`/order/${newOrder.id}`);
}
