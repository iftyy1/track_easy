import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq } from 'drizzle-orm';

export default async function TrackOrderPage({ params }: { params: { shareableId: string } }) {
  const [order] = await db.select().from(orders).where(eq(orders.shareableLink, params.shareableId));

  if (!order) return <p>Order not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your order status in real-time</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Customer Name</label>
                <p className="text-gray-900">{order.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-gray-900">{order.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                <p className="text-gray-900">{order.address}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Product</label>
                <p className="text-gray-900">{order.productName}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Status</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-blue-900 font-medium">{order.status}</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Share this link to track this order: 
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/{order.shareableLink}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
