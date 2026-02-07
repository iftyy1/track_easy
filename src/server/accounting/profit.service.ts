import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { eq, and, sql } from 'drizzle-orm';

export interface OrderProfitResult {
    unitCostSnapshot: number | null;
    totalCost: number | null;
    profit: number | null;
}

export function calculateOrderProfit(
    price: number,
    quantity: number = 1, // Default to 1 for now as orders don't have explicit quantity in schema yet
    unitCost: number | null
): OrderProfitResult {
    if (unitCost === null) {
        return {
            unitCostSnapshot: null,
            totalCost: null,
            profit: null,
        };
    }

    const totalCost = unitCost * quantity;
    const profit = price - totalCost;

    return {
        unitCostSnapshot: unitCost,
        totalCost,
        profit,
    };
}

export interface ProfitAnalytics {
    totalProfit: number;
    monthlyProfit: number;
    profitMargin: number;
}

export async function getProfitAnalytics(userId: string, month: number, year: number): Promise<ProfitAnalytics> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Total Profit Query
    const totalStats = await db
        .select({
            totalProfit: sql<number>`sum(${orders.profit})`,
            totalRevenue: sql<number>`sum(${orders.price})`,
        })
        .from(orders)
        .where(eq(orders.userId, userId));

    // Monthly Profit Query
    const monthlyStats = await db
        .select({
            monthlyProfit: sql<number>`sum(${orders.profit})`,
        })
        .from(orders)
        .where(
            and(
                eq(orders.userId, userId),
                sql`${orders.createdAt} >= ${startOfMonth.toISOString()}`,
                sql`${orders.createdAt} <= ${endOfMonth.toISOString()}`
            )
        );

    const totalProfit = Number(totalStats[0]?.totalProfit || 0);
    const totalRevenue = Number(totalStats[0]?.totalRevenue || 0);
    const monthlyProfit = Number(monthlyStats[0]?.monthlyProfit || 0);

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
        totalProfit,
        monthlyProfit,
        profitMargin,
    };
}
