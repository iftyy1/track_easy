import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import StatusDropdown from '@/components/StatusDropdown';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.id));

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Orders
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and track all your orders
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first order</p>
            <Link
              href="/order/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Create First Order
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {userOrders.length} Order{userOrders.length !== 1 ? 's' : ''} Total
              </h2>
            </div>
            
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product & Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Link
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userOrders.map((order) => {
                    const shareableUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${order.shareableLink}`;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              📞 {order.phone || 'No phone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              📦 {order.productName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs">
                              📍 {order.address || 'No address'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusDropdown 
                            orderId={order.id} 
                            currentStatus={order.status || 'Processing'} 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                {order.shareableLink}
                              </code>
                              <CopyButton url={shareableUrl} />
                            </div>
                            <div className="text-xs text-gray-500">
                              Link: /track/{order.shareableLink}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/order/${order.id}`}
                              className="text-blue-600 hover:text-blue-900 transition duration-200"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/track/${order.shareableLink}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900 transition duration-200"
                            >
                              Preview
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/order/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Create New Order
          </Link>
        </div>
      </div>
    </div>
  );
}
