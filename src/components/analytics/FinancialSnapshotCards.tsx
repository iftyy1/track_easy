'use client';

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Receipt } from 'lucide-react';

interface CardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: number;
    colorClass?: string;
}

function MetricCard({ title, value, icon, trend, colorClass = 'text-black' }: CardProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-sm font-medium">{title}</span>
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className={`text-2xl font-bold ${colorClass}`}>
                {formatCurrency(value)}
            </div>
            {trend !== undefined && trend !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
                </div>
            )}
        </div>
    );
}

interface FinancialSnapshotCardsProps {
    revenue: number;
    netProfit: number;
    expenses: number;
    cogs: number;
    grossProfit: number;
    trends?: {
        revenue?: number;
        netProfit?: number;
        expenses?: number;
    };
}

export default function FinancialSnapshotCards({
    revenue,
    netProfit,
    expenses,
    cogs,
    grossProfit,
    trends,
}: FinancialSnapshotCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Revenue"
                value={revenue}
                icon={<DollarSign className="w-5 h-5 text-gray-600" />}
                trend={trends?.revenue}
            />
            <MetricCard
                title="Gross Profit"
                value={grossProfit}
                icon={<Package className="w-5 h-5 text-gray-600" />}
                colorClass={grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}
            />
            <MetricCard
                title="Expenses"
                value={expenses}
                icon={<Receipt className="w-5 h-5 text-gray-600" />}
                trend={trends?.expenses}
                colorClass="text-red-600"
            />
            <MetricCard
                title="Net Profit"
                value={netProfit}
                icon={<ShoppingCart className="w-5 h-5 text-gray-600" />}
                trend={trends?.netProfit}
                colorClass={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
            />
        </div>
    );
}
