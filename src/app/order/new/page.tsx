'use client';
import { createOrder } from '@/src/app/actions/createOrder';

export default function NewOrderPage() {
  return (
    <form action={createOrder} className="space-y-4 p-4">
      <input name="name" placeholder="Name" required />
      <input name="address" placeholder="Address" required />
      <input name="phone" placeholder="Phone Number" required />
      <input name="productName" placeholder="Product Name" required />
      <button type="submit">Create Order</button>
    </form>
  );
}
