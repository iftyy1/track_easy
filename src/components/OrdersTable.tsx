import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import StatusDropdown from '@/components/StatusDropdown';

interface Order {
    id: string;
    userId: string;
    orderNumber: number;
    shareableLink: string;
    name: string | null;
    address: string | null;
    phone: string | null;
    productName: string | null;
    status: string | null;
    price: string | null;
    createdAt: Date | null;
}

interface OrdersTableProps {
    orders: Order[];
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    month?: number;
    year?: number;
}

const ORDERS_PER_PAGE = 10;

export default function OrdersTable({ orders, currentPage, totalPages, totalOrders, month, year }: OrdersTableProps) {
    // Build query string with filter params
    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (month) params.set('month', month.toString());
        if (year) params.set('year', year.toString());
        return `/orders?${params.toString()}`;
    };
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ORDERS_PER_PAGE, totalOrders);

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {orders.length > 0 ? (
                    orders.map((order) => {
                        const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${order.shareableLink}`;

                        // Format order number as #0001, #0002, etc.
                        const formattedOrderNumber = `#${order.orderNumber.toString().padStart(4, '0')}`;

                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative">
                                {/* Order Number Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-900 text-white">
                                        {formattedOrderNumber}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 mt-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer Name</h4>
                                            <p className="font-medium text-gray-900">{order.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Address</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed max-w-md">{order.address || '—'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</h4>
                                            <p className="text-sm text-gray-600 font-mono">{order.phone || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Details</h4>
                                            <p className="font-medium text-gray-900">{order.productName || 'Unnamed Product'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Price</h4>
                                            <p className="font-medium text-gray-900">৳ {order.price || '0'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tracking Link</h4>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">#{order.shareableLink}</span>
                                                <CopyButton url={shareableUrl} />
                                            </div>
                                        </div>

                                        {/* Status moved here for visibility */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</h4>
                                            <div className="w-48">
                                                <StatusDropdown orderId={order.id} currentStatus={order.status || 'Processing'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Right Actions */}
                                <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                    <Link
                                        href={`/track/${order.shareableLink}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Preview
                                    </Link>
                                    <Link
                                        href={`/order/${order.id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                        No orders found on this page.
                    </div>
                )}
            </div>

            {/* Pagination settings */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 px-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                        <Link
                            href={buildPageUrl(currentPage - 1)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                                ? 'pointer-events-none text-gray-300'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                        >
                            Previous
                        </Link>
                        <Link
                            href={buildPageUrl(currentPage + 1)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                                ? 'pointer-events-none text-gray-300'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                        >
                            Next
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
