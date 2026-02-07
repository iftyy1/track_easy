import { db } from '../db';
import { orders } from '../db/schema/orders';
import { expenses } from '../db/schema/financials';
import { materialPurchases, productionBatches } from '../db/schema/accounting';
import { sql, and, between } from 'drizzle-orm';

export interface CashFlowSummary {
    cashIn: number;
    cashOut: number;
    netCashFlow: number;
    breakdown: {
        inflows: {
            sales: number;
        };
        outflows: {
            expenses: number;
            materials: number;
            labor: number;
        };
    };
}

export const getCashFlow = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<CashFlowSummary> => {
    // Cash Inflows
    // 1. Revenue Collected (Orders)
    const salesRes = await db
        .select({ total: sql<number>`sum(${orders.price})` })
        .from(orders)
        .where(
            and(
                sql`${orders.userId} = ${userId}`,
                between(orders.createdAt, startDate, endDate)
            )
        );
    const sales = Number(salesRes[0]?.total || 0);

    // Cash Outflows
    // 1. Expenses
    const expensesRes = await db
        .select({ total: sql<number>`sum(${expenses.amount})` })
        .from(expenses)
        .where(
            and(
                sql`${expenses.userId} = ${userId}`,
                between(expenses.expenseDate, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            )
        );
    const totalExpenses = Number(expensesRes[0]?.total || 0);

    // 2. Material Purchases
    const materialsRes = await db
        .select({ total: sql<number>`sum(${materialPurchases.totalCost})` })
        .from(materialPurchases)
        .where(
            and(
                sql`${materialPurchases.userId} = ${userId}`,
                between(materialPurchases.purchaseDate, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            )
        );
    const totalMaterials = Number(materialsRes[0]?.total || 0);

    // 3. Production Labor
    const laborRes = await db
        .select({ total: sql<number>`sum(${productionBatches.laborCost})` })
        .from(productionBatches)
        .where(
            and(
                sql`${productionBatches.userId} = ${userId}`,
                between(productionBatches.productionDate, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            )
        );
    const totalLabor = Number(laborRes[0]?.total || 0);

    const totalIn = sales;
    const totalOut = totalExpenses + totalMaterials + totalLabor;
    const netCashFlow = totalIn - totalOut;

    return {
        cashIn: totalIn,
        cashOut: totalOut,
        netCashFlow,
        breakdown: {
            inflows: {
                sales,
            },
            outflows: {
                expenses: totalExpenses,
                materials: totalMaterials,
                labor: totalLabor,
            },
        },
    };
};
