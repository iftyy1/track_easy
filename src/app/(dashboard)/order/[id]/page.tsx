import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StatusDropdown from '@/components/StatusDropdown';

export default async function OrderPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, params.id), eq(orders.userId, session!.user.id)));

    if (!order) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center max-w-md">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-4">This order doesn't exist or you don't have permission.</p>
                    <Link
                        href="/orders"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const shareableUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${order.shareableLink}`;

    return (
        <div className="p-8">
            <div className="max-w-2xl">
                <div className="mb-6">
                    <Link href="/orders" className="text-blue-600 hover:text-blue-700 text-sm">
                        ← Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                            <p className="text-gray-500 text-sm mt-1">ID: {order.id.slice(0, 8)}...</p>
                        </div>
                        <StatusDropdown orderId={order.id} currentStatus={order.status || 'Processing'} />
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Customer</label>
                                <p className="text-gray-900 font-medium">{order.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="text-gray-900">{order.phone}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Product</label>
                                <p className="text-gray-900">{order.productName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Price</label>
                                <p className="text-gray-900 font-medium">৳{order.price || '0'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Address</label>
                                <p className="text-gray-900">{order.address}</p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Link</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <code className="text-sm text-gray-800 break-all">{shareableUrl}</code>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Link
                                    href={`/track/${order.shareableLink}`}
                                    target="_blank"
                                    className="bg-black text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                >
                                    Preview
                                </Link>
                                <CopyButton url={shareableUrl} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
