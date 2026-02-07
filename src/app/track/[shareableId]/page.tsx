import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
  Processing: { bg: 'bg-gray-50', dot: 'bg-gray-400', text: 'text-gray-700' },
  Ready: { bg: 'bg-gray-50', dot: 'bg-black', text: 'text-black font-semibold' },
  Shipped: { bg: 'bg-black text-white', dot: 'bg-white', text: 'text-white font-semibold' },
  Returned: { bg: 'bg-gray-50', dot: 'bg-gray-400', text: 'text-gray-500 line-through' },
  Cancelled: { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-900' },
};

export default async function TrackOrderPage({ params }: { params: Promise<{ shareableId: string }> }) {
  const { shareableId } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.shareableLink, shareableId));

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <p className="text-xl font-serif mb-4">Order not found</p>
      <Link href="/" className="text-sm underline underline-offset-4">Return Home</Link>
    </div>
  );

  const status = order.status || 'Processing';
  const styles = statusStyles[status] || statusStyles.Processing;

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight mb-6 inline-block opacity-50 hover:opacity-100 transition-opacity">
            TrackEasy.
          </Link>
          <h1 className="text-4xl font-serif font-medium text-black mb-2 tracking-tight">
            Order Tracking
          </h1>
          <p className="text-gray-500">
            Real-time status for order <span className="font-mono text-black">#{shareableId}</span>
          </p>
        </div>

        <div className="space-y-8">
          {/* Status Banner */}
          <div className={`${styles.bg} p-6 rounded-xl flex items-center justify-between transition-colors duration-300`}>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 ${styles.dot} rounded-full`}></div>
              <div>
                <p className={`text-sm uppercase tracking-wider opacity-70 ${styles.text.includes('text-white') ? 'text-white' : 'text-gray-500'}`}>Current Status</p>
                <p className={`text-xl ${styles.text}`}>{status}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-serif text-lg border-b border-gray-100 pb-2 mb-4">Customer Details</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Name</dt>
                  <dd className="font-medium text-lg">{order.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Contact</dt>
                  <dd className="font-medium">{order.phone}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Delivery Address</dt>
                  <dd className="font-medium">{order.address}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-serif text-lg border-b border-gray-100 pb-2 mb-4">Order Summary</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Product</dt>
                  <dd className="font-medium text-lg">{order.productName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Total Amount</dt>
                  <dd className="font-medium text-lg">৳{order.price}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 mb-4">
              Need help? Contact the merchant directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
