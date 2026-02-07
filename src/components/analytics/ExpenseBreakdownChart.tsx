'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

interface ExpenseBreakdownChartProps {
    data: ExpenseBreakdown[];
}

const CATEGORY_COLORS: Record<string, string> = {
    marketing: '#3B82F6',
    operations: '#10B981',
    salary: '#F59E0B',
    rent: '#8B5CF6',
    other: '#6B7280',
};

export default function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-black mb-4">Expense Breakdown</h3>
                <div className="flex items-center justify-center h-48 text-gray-400">
                    No expense data available
                </div>
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.category.charAt(0).toUpperCase() + d.category.slice(1)),
        datasets: [
            {
                data: data.map((d) => d.amount),
                backgroundColor: data.map((d) => CATEGORY_COLORS[d.category.toLowerCase()] || '#6B7280'),
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: { label?: string; raw?: unknown }) => {
                        return `${context.label}: ${formatCurrency(context.raw as number)}`;
                    },
                },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Expense Breakdown</h3>
            <div className="h-64">
                <Pie data={chartData} options={options} />
            </div>
            <div className="mt-4 space-y-2">
                {data.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[item.category.toLowerCase()] || '#6B7280' }}
                            />
                            <span className="text-gray-600 capitalize">{item.category}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
