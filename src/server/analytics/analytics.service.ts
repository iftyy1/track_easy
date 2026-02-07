import { db } from '@/server/db';
import { orders } from '@/server/db/schema/orders';
import { expenses } from '@/server/db/schema/financials';
import { materialPurchases } from '@/server/db/schema/accounting';
import { and, sql, eq } from 'drizzle-orm';

// Category types for filtering
export const ExpenseCategories = {
    MARKETING: 'marketing',
    OPERATIONS: 'operations',
    SALARY: 'salary',
    RENT: 'rent',
    OTHER: 'other',
} as const;

export type ExpenseCategory = (typeof ExpenseCategories)[keyof typeof ExpenseCategories];

// ============================================================
// Monthly Business Summary
// ============================================================

export interface MonthlyBusinessSummary {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    marketingSpend: number;
    materialCost: number;
    ordersCount: number;
    productsSold: number;
    month: number;
    year: number;
}

export async function getMonthlyBusinessSummary(
    userId: string,
    month: number,
    year: number
): Promise<MonthlyBusinessSummary> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Revenue, COGS, Orders Count from Orders
    const orderMetrics = await db
        .select({
            revenue: sql<number>`COALESCE(sum(${orders.price}), 0)`,
            cogs: sql<number>`COALESCE(sum(${orders.totalCost}), 0)`,
            ordersCount: sql<number>`COALESCE(count(*), 0)`,
            productsSold: sql<number>`COALESCE(count(*), 0)`, // Assuming 1 product per order for now
        })
        .from(orders)
        .where(
            and(
                eq(orders.userId, userId),
                sql`${orders.createdAt} >= ${startOfMonth.toISOString()}`,
                sql`${orders.createdAt} <= ${endOfMonth.toISOString()}`
            )
        );

    const revenue = Number(orderMetrics[0]?.revenue || 0);
    const cogs = Number(orderMetrics[0]?.cogs || 0);
    const ordersCount = Number(orderMetrics[0]?.ordersCount || 0);
    const productsSold = Number(orderMetrics[0]?.productsSold || 0);
    const grossProfit = revenue - cogs;

    // Total Expenses
    const expenseMetrics = await db
        .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                sql`${expenses.expenseDate} >= ${startDateStr}`,
                sql`${expenses.expenseDate} <= ${endDateStr}`
            )
        );

    const totalExpenses = Number(expenseMetrics[0]?.total || 0);

    // Marketing Spend
    const marketingMetrics = await db
        .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                sql`LOWER(${expenses.category}) = 'marketing'`,
                sql`${expenses.expenseDate} >= ${startDateStr}`,
                sql`${expenses.expenseDate} <= ${endDateStr}`
            )
        );

    const marketingSpend = Number(marketingMetrics[0]?.total || 0);

    // Material Cost (from purchases)
    const materialMetrics = await db
        .select({
            total: sql<number>`COALESCE(sum(${materialPurchases.totalCost}), 0)`,
        })
        .from(materialPurchases)
        .where(
            and(
                eq(materialPurchases.userId, userId),
                sql`${materialPurchases.purchaseDate} >= ${startDateStr}`,
                sql`${materialPurchases.purchaseDate} <= ${endDateStr}`
            )
        );

    const materialCost = Number(materialMetrics[0]?.total || 0);

    const netProfit = grossProfit - totalExpenses;

    return {
        revenue,
        cogs,
        grossProfit,
        expenses: totalExpenses,
        netProfit,
        marketingSpend,
        materialCost,
        ordersCount,
        productsSold,
        month,
        year,
    };
}

// ============================================================
// Month-over-Month Comparison
// ============================================================

export type ChangeStatus = 'up' | 'down' | 'unchanged' | 'warning';

export interface MetricComparison {
    metric: string;
    current: number;
    last: number;
    changePercent: number;
    status: ChangeStatus;
}

export interface MonthComparisonResult {
    currentMonth: { month: number; year: number };
    lastMonth: { month: number; year: number };
    comparisons: MetricComparison[];
}

function calculateChangePercent(current: number, last: number): number {
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / Math.abs(last)) * 100;
}

function determineStatus(metric: string, changePercent: number): ChangeStatus {
    // Costs increasing is a warning
    const costMetrics = ['expenses', 'marketingSpend', 'materialCost', 'cogs'];
    const isCostMetric = costMetrics.includes(metric);

    if (changePercent === 0) return 'unchanged';

    if (isCostMetric) {
        return changePercent > 50 ? 'warning' : changePercent > 0 ? 'up' : 'down';
    }

    // Revenue and profit increasing is good
    return changePercent > 0 ? 'up' : 'down';
}

export async function compareMonths(
    userId: string,
    currentMonth: number,
    currentYear: number
): Promise<MonthComparisonResult> {
    // Calculate last month
    let lastMonth = currentMonth - 1;
    let lastYear = currentYear;
    if (lastMonth < 1) {
        lastMonth = 12;
        lastYear = currentYear - 1;
    }

    const currentSummary = await getMonthlyBusinessSummary(userId, currentMonth, currentYear);
    const lastSummary = await getMonthlyBusinessSummary(userId, lastMonth, lastYear);

    const metricsToCompare = [
        { key: 'revenue', label: 'Revenue' },
        { key: 'grossProfit', label: 'Gross Profit' },
        { key: 'netProfit', label: 'Net Profit' },
        { key: 'expenses', label: 'Expenses' },
        { key: 'marketingSpend', label: 'Marketing Spend' },
        { key: 'materialCost', label: 'Material Cost' },
        { key: 'ordersCount', label: 'Orders' },
    ] as const;

    const comparisons: MetricComparison[] = metricsToCompare.map(({ key, label }) => {
        const current = currentSummary[key as keyof MonthlyBusinessSummary] as number;
        const last = lastSummary[key as keyof MonthlyBusinessSummary] as number;
        const changePercent = calculateChangePercent(current, last);

        return {
            metric: label,
            current,
            last,
            changePercent,
            status: determineStatus(key, changePercent),
        };
    });

    return {
        currentMonth: { month: currentMonth, year: currentYear },
        lastMonth: { month: lastMonth, year: lastYear },
        comparisons,
    };
}

// ============================================================
// Marketing Performance (ROAS)
// ============================================================

export type MarketingVerdict = 'strong' | 'average' | 'unprofitable' | 'no-data';

export interface MarketingPerformance {
    adSpend: number;
    revenue: number;
    roas: number;
    verdict: MarketingVerdict;
    verdictLabel: string;
}

export async function getMarketingPerformance(
    userId: string,
    month: number,
    year: number
): Promise<MarketingPerformance> {
    const summary = await getMonthlyBusinessSummary(userId, month, year);

    const adSpend = summary.marketingSpend;
    const revenue = summary.revenue;

    if (adSpend === 0) {
        return {
            adSpend: 0,
            revenue,
            roas: 0,
            verdict: 'no-data',
            verdictLabel: 'No marketing spend',
        };
    }

    const roas = revenue / adSpend;

    let verdict: MarketingVerdict;
    let verdictLabel: string;

    if (roas > 3) {
        verdict = 'strong';
        verdictLabel = 'Strong marketing performance';
    } else if (roas >= 1) {
        verdict = 'average';
        verdictLabel = 'Average performance';
    } else {
        verdict = 'unprofitable';
        verdictLabel = 'Unprofitable ads';
    }

    return {
        adSpend,
        revenue,
        roas,
        verdict,
        verdictLabel,
    };
}

// ============================================================
// Business Health Indicators
// ============================================================

export type HealthLevel = 'healthy' | 'moderate' | 'at-risk';

export interface HealthIndicator {
    category: string;
    level: HealthLevel;
    label: string;
}

export interface BusinessHealth {
    overall: HealthLevel;
    indicators: HealthIndicator[];
}

export function getBusinessHealth(
    summary: MonthlyBusinessSummary,
    comparison: MonthComparisonResult
): BusinessHealth {
    const indicators: HealthIndicator[] = [];

    // Profit Health
    if (summary.netProfit > 0) {
        indicators.push({ category: 'Profitability', level: 'healthy', label: 'Profitable' });
    } else if (summary.netProfit === 0) {
        indicators.push({ category: 'Profitability', level: 'moderate', label: 'Break-even' });
    } else {
        indicators.push({ category: 'Profitability', level: 'at-risk', label: 'Loss Making' });
    }

    // Growth Health
    const revenueChange = comparison.comparisons.find(c => c.metric === 'Revenue');
    if (revenueChange) {
        if (revenueChange.changePercent > 10) {
            indicators.push({ category: 'Growth', level: 'healthy', label: 'Growing' });
        } else if (revenueChange.changePercent >= 0) {
            indicators.push({ category: 'Growth', level: 'moderate', label: 'Stable' });
        } else {
            indicators.push({ category: 'Growth', level: 'at-risk', label: 'Declining' });
        }
    }

    // Cost Control
    const expenseChange = comparison.comparisons.find(c => c.metric === 'Expenses');
    if (revenueChange && expenseChange) {
        if (expenseChange.changePercent > revenueChange.changePercent && expenseChange.changePercent > 0) {
            indicators.push({ category: 'Cost Control', level: 'at-risk', label: 'Costs rising faster than revenue' });
        } else {
            indicators.push({ category: 'Cost Control', level: 'healthy', label: 'Costs under control' });
        }
    }

    // Overall health
    const riskCount = indicators.filter(i => i.level === 'at-risk').length;
    const moderateCount = indicators.filter(i => i.level === 'moderate').length;

    let overall: HealthLevel = 'healthy';
    if (riskCount >= 2) {
        overall = 'at-risk';
    } else if (riskCount >= 1 || moderateCount >= 2) {
        overall = 'moderate';
    }

    return { overall, indicators };
}

// ============================================================
// AI-Style Insight Generator (Rule-Based MVP)
// ============================================================

export interface BusinessInsights {
    summary: string;
    insights: string[];
}

export function generateBusinessInsights(
    summary: MonthlyBusinessSummary,
    comparison: MonthComparisonResult,
    marketingPerf: MarketingPerformance
): BusinessInsights {
    const insights: string[] = [];

    // Revenue insight
    const revenueChange = comparison.comparisons.find(c => c.metric === 'Revenue');
    if (revenueChange) {
        if (revenueChange.changePercent > 0) {
            insights.push(`Your revenue increased by ${revenueChange.changePercent.toFixed(1)}% compared to last month.`);
        } else if (revenueChange.changePercent < 0) {
            insights.push(`Your revenue decreased by ${Math.abs(revenueChange.changePercent).toFixed(1)}% compared to last month.`);
        } else {
            insights.push('Your revenue remained stable compared to last month.');
        }
    }

    // Profit insight
    if (summary.netProfit > 0) {
        insights.push(`Your business is profitable with a net profit of ৳${summary.netProfit.toLocaleString()}.`);
    } else if (summary.netProfit < 0) {
        insights.push(`You are operating at a loss of ৳${Math.abs(summary.netProfit).toLocaleString()} this month.`);
    }

    // Marketing insight
    const marketingChange = comparison.comparisons.find(c => c.metric === 'Marketing Spend');
    if (marketingChange && revenueChange && marketingPerf.adSpend > 0) {
        if (marketingChange.changePercent > revenueChange.changePercent * 2) {
            insights.push(`Marketing spend increased by ${marketingChange.changePercent.toFixed(1)}% but revenue only grew ${revenueChange.changePercent.toFixed(1)}%.`);
        }
        if (marketingPerf.roas > 3) {
            insights.push(`Your ROAS of ${marketingPerf.roas.toFixed(1)} indicates strong marketing performance.`);
        } else if (marketingPerf.roas < 1) {
            insights.push(`Your ROAS of ${marketingPerf.roas.toFixed(1)} indicates unprofitable ad spend.`);
        }
    }

    // Material cost insight
    const materialChange = comparison.comparisons.find(c => c.metric === 'Material Cost');
    if (materialChange) {
        if (materialChange.changePercent < -5) {
            insights.push('Material costs decreased, improving margins.');
        } else if (materialChange.changePercent > 20) {
            insights.push(`Material costs rose by ${materialChange.changePercent.toFixed(1)}%, which may impact profitability.`);
        }
    }

    // Expense insight
    const expenseChange = comparison.comparisons.find(c => c.metric === 'Expenses');
    if (expenseChange && revenueChange) {
        if (expenseChange.changePercent > revenueChange.changePercent && expenseChange.changePercent > 10) {
            insights.push('Costs are rising faster than revenue. Consider reviewing expenses.');
        }
    }

    // Generate summary paragraph
    const summaryParts: string[] = [];
    summaryParts.push(`Your business generated ৳${summary.revenue.toLocaleString()} revenue this month`);

    if (revenueChange && revenueChange.changePercent !== 0) {
        summaryParts[0] += `, a ${revenueChange.changePercent > 0 ? '' : 'decrease of '}${Math.abs(revenueChange.changePercent).toFixed(0)}% ${revenueChange.changePercent > 0 ? 'increase' : ''} from last month`;
    }

    if (summary.netProfit > 0) {
        summaryParts.push('Overall profitability remains positive');
    } else {
        summaryParts.push('The business is currently operating at a loss');
    }

    const fullSummary = summaryParts.join('. ') + '.';

    return {
        summary: fullSummary,
        insights,
    };
}

// ============================================================
// Expense Breakdown by Category
// ============================================================

export interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export async function getExpenseBreakdown(
    userId: string,
    month: number,
    year: number
): Promise<ExpenseBreakdown[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    const result = await db
        .select({
            category: expenses.category,
            amount: sql<number>`COALESCE(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                sql`${expenses.expenseDate} >= ${startDateStr}`,
                sql`${expenses.expenseDate} <= ${endDateStr}`
            )
        )
        .groupBy(expenses.category);

    const total = result.reduce((sum, r) => sum + Number(r.amount), 0);

    return result.map(r => ({
        category: r.category || 'Other',
        amount: Number(r.amount),
        percentage: total > 0 ? (Number(r.amount) / total) * 100 : 0,
    }));
}

// ============================================================
// Break-Even Analysis
// ============================================================

// Cost behavior classification for expense categories
export const FixedCostCategories = ['rent', 'salary', 'utilities', 'insurance', 'software', 'subscription'];
export const VariableCostCategories = ['marketing', 'shipping', 'packaging', 'commission'];

export type SafetyStatus = 'very-safe' | 'safe' | 'moderate' | 'risky' | 'loss';

export interface BreakEvenAnalysis {
    revenue: number;
    fixedCosts: number;
    variableCosts: number;
    contributionMargin: number;
    cmRatio: number;
    breakEvenRevenue: number;
    breakEvenUnits: number;
    averageSellingPrice: number;
    variableCostPerUnit: number;
    safetyMargin: number;
    safetyMarginPercent: number;
    profitAfterBreakEven: number;
    status: SafetyStatus;
    statusLabel: string;
    unitsSold: number;
}

export async function getBreakEvenAnalysis(
    userId: string,
    month: number,
    year: number
): Promise<BreakEvenAnalysis> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Get basic summary for revenue, COGS, orders
    const summary = await getMonthlyBusinessSummary(userId, month, year);

    // Fixed Costs: Expenses in fixed categories
    const fixedCostConditions = FixedCostCategories.map(cat => `LOWER(${expenses.category}) = '${cat}'`).join(' OR ');
    const fixedCostMetrics = await db
        .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                sql`(${sql.raw(fixedCostConditions)})`,
                sql`${expenses.expenseDate} >= ${startDateStr}`,
                sql`${expenses.expenseDate} <= ${endDateStr}`
            )
        );

    const fixedCosts = Number(fixedCostMetrics[0]?.total || 0);

    // Variable Costs = COGS + Material Purchases (for the period)
    // COGS is already in summary, plus we check if there are additional variable expense categories
    const variableCostConditions = VariableCostCategories.map(cat => `LOWER(${expenses.category}) = '${cat}'`).join(' OR ');
    const variableExpenseMetrics = await db
        .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                sql`(${sql.raw(variableCostConditions)})`,
                sql`${expenses.expenseDate} >= ${startDateStr}`,
                sql`${expenses.expenseDate} <= ${endDateStr}`
            )
        );

    const variableExpenses = Number(variableExpenseMetrics[0]?.total || 0);

    // Variable costs = COGS + variable expense categories + material purchases
    const variableCosts = summary.cogs + variableExpenses + summary.materialCost;

    const revenue = summary.revenue;
    const unitsSold = summary.ordersCount;

    // Contribution Margin
    const contributionMargin = revenue - variableCosts;

    // CM Ratio (avoid division by zero)
    const cmRatio = revenue > 0 ? contributionMargin / revenue : 0;

    // Break-Even Revenue = Fixed Costs / CM Ratio
    const breakEvenRevenue = cmRatio > 0 ? fixedCosts / cmRatio : 0;

    // Average selling price per unit
    const averageSellingPrice = unitsSold > 0 ? revenue / unitsSold : 0;

    // Variable cost per unit
    const variableCostPerUnit = unitsSold > 0 ? variableCosts / unitsSold : 0;

    // Break-Even Units = Fixed Costs / (Selling Price - Variable Cost per Unit)
    const contributionPerUnit = averageSellingPrice - variableCostPerUnit;
    const breakEvenUnits = contributionPerUnit > 0 ? Math.ceil(fixedCosts / contributionPerUnit) : 0;

    // Safety Margin
    const safetyMargin = revenue - breakEvenRevenue;
    const safetyMarginPercent = revenue > 0 ? (safetyMargin / revenue) * 100 : 0;

    // Profit after break-even
    const profitAfterBreakEven = revenue - breakEvenRevenue;

    // Determine status based on safety margin %
    let status: SafetyStatus;
    let statusLabel: string;

    if (safetyMarginPercent >= 30) {
        status = 'very-safe';
        statusLabel = 'Very Safe';
    } else if (safetyMarginPercent >= 10) {
        status = 'safe';
        statusLabel = 'Safe';
    } else if (safetyMarginPercent >= 0) {
        status = 'risky';
        statusLabel = 'Risky';
    } else {
        status = 'loss';
        statusLabel = 'Loss Zone';
    }

    // Edge case: If no revenue, but there are fixed costs, it's loss
    if (revenue === 0 && fixedCosts > 0) {
        status = 'loss';
        statusLabel = 'Loss Zone';
    }

    // Edge case: Negative contribution margin
    if (contributionMargin < 0 && revenue > 0) {
        status = 'loss';
        statusLabel = 'Loss Zone - Negative Margins';
    }

    return {
        revenue,
        fixedCosts,
        variableCosts,
        contributionMargin,
        cmRatio,
        breakEvenRevenue,
        breakEvenUnits,
        averageSellingPrice,
        variableCostPerUnit,
        safetyMargin,
        safetyMarginPercent,
        profitAfterBreakEven,
        status,
        statusLabel,
        unitsSold,
    };
}

// ============================================================
// Break-Even Insights Generator
// ============================================================

export function generateBreakEvenInsights(analysis: BreakEvenAnalysis): string[] {
    const insights: string[] = [];

    // Break-even requirement
    if (analysis.breakEvenRevenue > 0) {
        insights.push(`You need ৳${analysis.breakEvenRevenue.toLocaleString()} in sales to break even.`);
    }

    // Break-even units
    if (analysis.breakEvenUnits > 0 && analysis.unitsSold > 0) {
        if (analysis.unitsSold >= analysis.breakEvenUnits) {
            insights.push(`You must sell ${analysis.breakEvenUnits} units to break even. You sold ${analysis.unitsSold} units.`);
        } else {
            const unitsShort = analysis.breakEvenUnits - analysis.unitsSold;
            insights.push(`You need to sell ${unitsShort} more units to reach break-even.`);
        }
    }

    // Profit/Loss commentary
    if (analysis.safetyMargin > 0) {
        insights.push(`You exceeded break-even by ৳${analysis.safetyMargin.toLocaleString()}.`);
    } else if (analysis.safetyMargin < 0) {
        insights.push(`Your revenue is below break-even by ৳${Math.abs(analysis.safetyMargin).toLocaleString()}. Cost reduction or sales growth is required.`);
    }

    // Safety margin commentary
    if (analysis.safetyMarginPercent >= 30) {
        insights.push(`Your safety margin is ${analysis.safetyMarginPercent.toFixed(0)}%, showing strong financial stability.`);
    } else if (analysis.safetyMarginPercent >= 10) {
        insights.push(`Your safety margin is ${analysis.safetyMarginPercent.toFixed(0)}%. Your business is operating safely above break-even.`);
    } else if (analysis.safetyMarginPercent > 0) {
        insights.push(`You are only ${analysis.safetyMarginPercent.toFixed(0)}% above break-even. A small drop in sales could lead to losses.`);
    }

    // Contribution margin insight
    if (analysis.cmRatio > 0) {
        insights.push(`Your contribution margin ratio is ${(analysis.cmRatio * 100).toFixed(0)}%, meaning ${(analysis.cmRatio * 100).toFixed(0)}% of each sale contributes to covering fixed costs.`);
    }

    return insights;
}

