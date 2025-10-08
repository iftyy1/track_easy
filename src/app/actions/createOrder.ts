'use server';

import { db } from '../../server/db';
import { orders } from '../../server/db/schema/orders';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

export async function createOrder(data: FormData) {
  const name = data.get('name') as string;
  const address = data.get('address') as string;
  const phone = data.get('phone') as string;
  const productName = data.get('productName') as string;
  const shareableLink = nanoid(10); // Generate a 10-character shareable link

  const [newOrder] = await db
    .insert(orders)
    .values({ name, address, phone, productName, shareableLink })
    .returning();

  redirect(`/order/${newOrder.id}`);
}
