import { db } from '../db';
import { orders } from '../db/schema/orders';
import { expenses } from '../db/schema/financials';
import { and, between, desc, gte, lte, sql } from 'drizzle-orm';

export interface PnLSummary {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
}

export const getPnL = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<PnLSummary> => {
    // Revenue & COGS from Orders
    const orderMetrics = await db
        .select({
            revenue: sql<number>`sum(${orders.price})`,
            cogs: sql<number>`sum(${orders.totalCost})`,
        })
        .from(orders)
        .where(
            and(
                sql`${orders.userId} = ${userId}`,
                between(orders.createdAt, startDate, endDate)
            )
        );

    const revenue = Number(orderMetrics[0]?.revenue || 0);
    const cogs = Number(orderMetrics[0]?.cogs || 0);
    const grossProfit = revenue - cogs;

    // Operating Expenses
    const expenseMetrics = await db
        .select({
            total: sql<number>`sum(${expenses.amount})`,
        })
        .from(expenses)
        .where(
            and(
                sql`${expenses.userId} = ${userId}`,
                between(expenses.expenseDate, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            )
        );

    const operatingExpenses = Number(expenseMetrics[0]?.total || 0);
    const netProfit = grossProfit - operatingExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
        revenue,
        cogs,
        grossProfit,
        expenses: operatingExpenses,
        netProfit,
        profitMargin,
    };
};
