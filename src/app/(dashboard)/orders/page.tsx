import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { desc, eq, count, and, gte, lte } from 'drizzle-orm';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OrdersTable from '@/components/OrdersTable';
import EmptyOrdersState from '@/components/EmptyOrdersState';
import { DashboardFilter } from '@/components/dashboard/DashboardFilter';

const ORDERS_PER_PAGE = 10;

interface OrdersPageProps {
    searchParams: Promise<{ page?: string; month?: string; year?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const offset = (currentPage - 1) * ORDERS_PER_PAGE;

    // Get month/year from search params or use current date
    const currentDate = new Date();
    const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1;
    const year = params.year ? parseInt(params.year) : currentDate.getFullYear();

    // Calculate date range for filtering
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Build the filter conditions
    const filterConditions = and(
        eq(orders.userId, session!.user.id),
        gte(orders.createdAt, startOfMonth),
        lte(orders.createdAt, endOfMonth)
    );

    // Get total count for pagination (filtered)
    const [{ total }] = await db
        .select({ total: count() })
        .from(orders)
        .where(filterConditions);

    const totalPages = Math.ceil(total / ORDERS_PER_PAGE);

    // Fetch paginated orders (filtered)
    const userOrders = await db
        .select()
        .from(orders)
        .where(filterConditions)
        .orderBy(desc(orders.createdAt))
        .limit(ORDERS_PER_PAGE)
        .offset(offset);

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
                    <p className="text-gray-600 mt-1">Manage and track all your orders</p>
                </div>
                <div className="flex items-center gap-4">
                    <DashboardFilter />
                    <Link
                        href="/order/new"
                        className="bg-black text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        + New Order
                    </Link>
                </div>
            </div>

            {total === 0 ? (
                <EmptyOrdersState />
            ) : (
                <OrdersTable
                    orders={userOrders}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalOrders={total}
                    month={month}
                    year={year}
                />
            )}
        </div>
    );
}
