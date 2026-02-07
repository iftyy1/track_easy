'use client';

import { useState, useEffect } from 'react';
import FinancialSnapshotCards from '@/components/analytics/FinancialSnapshotCards';
import MarketingPerformance from '@/components/analytics/MarketingPerformance';
import ExpenseBreakdownChart from '@/components/analytics/ExpenseBreakdownChart';
import MonthComparisonTable from '@/components/analytics/MonthComparisonTable';
import BusinessHealthIndicator from '@/components/analytics/BusinessHealthIndicator';
import InsightsSummary from '@/components/analytics/InsightsSummary';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import BreakEvenCard from '@/components/analytics/BreakEvenCard';
import SafetyGauge from '@/components/analytics/SafetyGauge';
import BreakEvenChart from '@/components/analytics/BreakEvenChart';
import { ChevronDown } from 'lucide-react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface FullInsightsData {
    summary: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        expenses: number;
        netProfit: number;
        marketingSpend: number;
        materialCost: number;
        ordersCount: number;
        productsSold: number;
    };
    comparison: {
        currentMonth: { month: number; year: number };
        lastMonth: { month: number; year: number };
        comparisons: Array<{
            metric: string;
            current: number;
            last: number;
            changePercent: number;
            status: 'up' | 'down' | 'unchanged' | 'warning';
        }>;
    };
    marketingPerf: {
        adSpend: number;
        revenue: number;
        roas: number;
        verdict: 'strong' | 'average' | 'unprofitable' | 'no-data';
        verdictLabel: string;
    };
    health: {
        overall: 'healthy' | 'moderate' | 'at-risk';
        indicators: Array<{
            category: string;
            level: 'healthy' | 'moderate' | 'at-risk';
            label: string;
        }>;
    };
    insights: {
        summary: string;
        insights: string[];
    };
}

interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

interface BreakEvenData {
    revenue: number;
    fixedCosts: number;
    variableCosts: number;
    contributionMargin: number;
    cmRatio: number;
    breakEvenRevenue: number;
    breakEvenUnits: number;
    safetyMargin: number;
    safetyMarginPercent: number;
    status: 'very-safe' | 'safe' | 'moderate' | 'risky' | 'loss';
    statusLabel: string;
    unitsSold: number;
    insights: string[];
}

export default function AnalyticsPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FullInsightsData | null>(null);
    const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
    const [breakEvenData, setBreakEvenData] = useState<BreakEvenData | null>(null);

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [insightsRes, expenseRes, breakEvenRes] = await Promise.all([
                fetch(`/api/analytics/business-insights?month=${month}&year=${year}`),
                fetch(`/api/analytics/expense-breakdown?month=${month}&year=${year}`),
                fetch(`/api/analytics/break-even?month=${month}&year=${year}`),
            ]);

            if (insightsRes.ok) {
                setData(await insightsRes.json());
            }
            if (expenseRes.ok) {
                setExpenseBreakdown(await expenseRes.json());
            }
            if (breakEvenRes.ok) {
                setBreakEvenData(await breakEvenRes.json());
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTrends = () => {
        if (!data?.comparison.comparisons) return {};
        const findChange = (metric: string) =>
            data.comparison.comparisons.find((c) => c.metric === metric)?.changePercent;
        return {
            revenue: findChange('Revenue'),
            netProfit: findChange('Net Profit'),
            expenses: findChange('Expenses'),
        };
    };

    // Generate chart data from comparison (current and last month)
    const getChartData = () => {
        if (!data) return [];
        const { currentMonth, lastMonth, comparisons } = data.comparison;

        const findMetric = (metric: string) => comparisons.find((c) => c.metric === metric);

        return [
            {
                month: `${MONTHS[lastMonth.month - 1].slice(0, 3)} ${lastMonth.year}`,
                revenue: findMetric('Revenue')?.last || 0,
                profit: findMetric('Net Profit')?.last || 0,
                marketingSpend: findMetric('Marketing Spend')?.last || 0,
            },
            {
                month: `${MONTHS[currentMonth.month - 1].slice(0, 3)} ${currentMonth.year}`,
                revenue: findMetric('Revenue')?.current || 0,
                profit: findMetric('Net Profit')?.current || 0,
                marketingSpend: findMetric('Marketing Spend')?.current || 0,
            },
        ];
    };

    // Combine insights from both sources
    const getAllInsights = () => {
        const insights = data?.insights.insights || [];
        const breakEvenInsights = breakEvenData?.insights || [];
        return [...insights, ...breakEvenInsights];
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-black">Business Analytics</h1>
                    <p className="text-gray-500 mt-1">
                        Performance insights for {MONTHS[month - 1]} {year}
                    </p>
                </div>

                {/* Month/Year Selector */}
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {[2024, 2025, 2026, 2027].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                </div>
            ) : data ? (
                <>
                    {/* AI Insights Summary */}
                    <InsightsSummary
                        summary={data.insights.summary}
                        insights={getAllInsights()}
                    />

                    {/* Financial Snapshot */}
                    <FinancialSnapshotCards
                        revenue={data.summary.revenue}
                        netProfit={data.summary.netProfit}
                        expenses={data.summary.expenses}
                        cogs={data.summary.cogs}
                        grossProfit={data.summary.grossProfit}
                        trends={getTrends()}
                    />

                    {/* Break-Even Section */}
                    {breakEvenData && (
                        <>
                            <div className="border-t border-gray-200 pt-8">
                                <h2 className="text-xl font-serif font-bold text-black mb-6">Break-Even Analysis</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <BreakEvenCard
                                    breakEvenRevenue={breakEvenData.breakEvenRevenue}
                                    actualRevenue={breakEvenData.revenue}
                                    safetyMargin={breakEvenData.safetyMargin}
                                    safetyMarginPercent={breakEvenData.safetyMarginPercent}
                                    status={breakEvenData.status}
                                    statusLabel={breakEvenData.statusLabel}
                                    breakEvenUnits={breakEvenData.breakEvenUnits}
                                    unitsSold={breakEvenData.unitsSold}
                                />
                                <SafetyGauge
                                    safetyMarginPercent={breakEvenData.safetyMarginPercent}
                                    status={breakEvenData.status}
                                />
                            </div>

                            <BreakEvenChart
                                breakEvenRevenue={breakEvenData.breakEvenRevenue}
                                actualRevenue={breakEvenData.revenue}
                                fixedCosts={breakEvenData.fixedCosts}
                                variableCosts={breakEvenData.variableCosts}
                                contributionMargin={breakEvenData.contributionMargin}
                            />
                        </>
                    )}

                    {/* Charts */}
                    <AnalyticsCharts data={getChartData()} />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Marketing Performance */}
                        <MarketingPerformance
                            adSpend={data.marketingPerf.adSpend}
                            revenue={data.marketingPerf.revenue}
                            roas={data.marketingPerf.roas}
                            verdict={data.marketingPerf.verdict}
                            verdictLabel={data.marketingPerf.verdictLabel}
                        />

                        {/* Business Health */}
                        <BusinessHealthIndicator
                            overall={data.health.overall}
                            indicators={data.health.indicators}
                        />
                    </div>

                    {/* Expense Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ExpenseBreakdownChart data={expenseBreakdown} />

                        {/* Orders Summary Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-black mb-4">Orders Summary</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                                    <p className="text-3xl font-bold text-black">{data.summary.ordersCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Products Sold</p>
                                    <p className="text-3xl font-bold text-black">{data.summary.productsSold}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Material Cost</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ৳{data.summary.materialCost.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Marketing Spend</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ৳{data.summary.marketingSpend.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Month Comparison Table */}
                    <MonthComparisonTable
                        comparisons={data.comparison.comparisons}
                        currentMonth={data.comparison.currentMonth}
                        lastMonth={data.comparison.lastMonth}
                    />
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No data available for the selected period
                </div>
            )}
        </div>
    );
}

