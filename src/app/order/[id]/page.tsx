import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const [order] = await db.select().from(orders).where(eq(orders.id, params.id));

  if (!order) return <p>Order not found</p>;

  return (
    <div className="p-4">
      <h1>Order for {order.name}</h1>
      <p>Address: {order.address}</p>
      <p>Phone: {order.phone}</p>
      <p>Product: {order.productName}</p>
      <p>Status: {order.status}</p>
    </div>
  );
}
