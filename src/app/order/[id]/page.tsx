import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, params.id), eq(orders.userId, session.user.id)));

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">This order doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/orders"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const shareableUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${order.shareableLink}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
          <p className="text-gray-600">Manage your order and share tracking link</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Information</h2>
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

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Shareable Tracking Link</h3>
            <p className="text-sm text-green-700 mb-3">
              Share this link with your customer to let them track their order:
            </p>
            <div className="bg-white p-3 rounded border">
              <code className="text-sm text-gray-800 break-all">{shareableUrl}</code>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/track/${order.shareableLink}`}
                target="_blank"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
              >
                Preview Tracking Page
              </Link>
              <CopyButton url={shareableUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
