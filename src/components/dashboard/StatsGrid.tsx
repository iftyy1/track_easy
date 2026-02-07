import { LucideIcon, ShoppingBag, Calendar, BarChart3, DollarSign, TrendingUp } from 'lucide-react';

interface StatProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-lg text-black">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export interface DashboardStats {
    totalOrders: number;
    monthlyOrders: number;
    weeklyOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
}

export interface ProfitAnalytics {
    totalProfit: number;
    monthlyProfit: number;
    profitMargin: number;
}

export function StatsGrid({ stats, profitStats }: { stats: DashboardStats; profitStats?: ProfitAnalytics }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('BDT', '৳');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={ShoppingBag}
                description="All time"
            />
            <StatCard
                title="Monthly Orders"
                value={stats.monthlyOrders}
                icon={Calendar}
                description="Selected Month"
            />
            <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={DollarSign}
                description="All time"
            />
            <StatCard
                title="Monthly Revenue"
                value={formatCurrency(stats.monthlyRevenue)}
                icon={TrendingUp}
                description="Selected Month"
            />

            {profitStats && (
                <>
                    <StatCard
                        title="Total Profit"
                        value={formatCurrency(profitStats.totalProfit)}
                        icon={DollarSign}
                        description="All time"
                    />
                    <StatCard
                        title="Monthly Profit"
                        value={formatCurrency(profitStats.monthlyProfit)}
                        icon={TrendingUp}
                        description="Selected Month"
                    />
                    <StatCard
                        title="Profit Margin"
                        value={`${profitStats.profitMargin.toFixed(1)}%`}
                        icon={BarChart3}
                        description="All time average"
                    />
                </>
            )}
        </div>
    );
}
