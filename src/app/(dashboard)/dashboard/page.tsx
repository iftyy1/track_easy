import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { DashboardFilter } from '@/components/dashboard/DashboardFilter';
import { getProfitAnalytics } from '@/server/accounting/profit.service';

async function getDashboardStats(userId: string, month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Start of current week (assuming week starts on Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch all orders for the user
    const allOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (parseFloat(order.price || '0') || 0), 0);

    // Filter for monthly stats
    const monthlyOrdersList = allOrders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(0);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
    });

    const monthlyOrders = monthlyOrdersList.length;
    const monthlyRevenue = monthlyOrdersList.reduce((sum, order) => sum + (parseFloat(order.price || '0') || 0), 0);

    // Filter for weekly stats (this week)
    const weeklyOrdersList = allOrders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(0);
        return orderDate >= startOfWeek;
    });

    const weeklyOrders = weeklyOrdersList.length;

    return {
        totalOrders,
        monthlyOrders,
        weeklyOrders,
        totalRevenue,
        monthlyRevenue
    };
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);

    // Await searchParams before accessing properties
    const params = await searchParams;
    const currentDate = new Date();
    const month = params.month ? parseInt(params.month as string) : currentDate.getMonth() + 1;
    const year = params.year ? parseInt(params.year as string) : currentDate.getFullYear();

    const stats = await getDashboardStats(session!.user.id, month, year);
    const profitStats = await getProfitAnalytics(session!.user.id, month, year);

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of your business performance</p>
                </div>
                <DashboardFilter />
            </div>

            <StatsGrid stats={stats} profitStats={profitStats} />
        </div>
    );
}

