'use client';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BreakEvenChartProps {
    breakEvenRevenue: number;
    actualRevenue: number;
    fixedCosts: number;
    variableCosts: number;
    contributionMargin: number;
}

export default function BreakEvenChart({
    breakEvenRevenue,
    actualRevenue,
    fixedCosts,
    variableCosts,
    contributionMargin,
}: BreakEvenChartProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);

    const revenueData = {
        labels: ['Break-Even vs Actual'],
        datasets: [
            {
                label: 'Break-Even Revenue',
                data: [breakEvenRevenue],
                backgroundColor: '#6B7280',
                borderRadius: 4,
            },
            {
                label: 'Actual Revenue',
                data: [actualRevenue],
                backgroundColor: actualRevenue >= breakEvenRevenue ? '#10B981' : '#EF4444',
                borderRadius: 4,
            },
        ],
    };

    const costData = {
        labels: ['Cost Breakdown'],
        datasets: [
            {
                label: 'Fixed Costs',
                data: [fixedCosts],
                backgroundColor: '#3B82F6',
                borderRadius: 4,
            },
            {
                label: 'Variable Costs',
                data: [variableCosts],
                backgroundColor: '#8B5CF6',
                borderRadius: 4,
            },
            {
                label: 'Contribution Margin',
                data: [contributionMargin],
                backgroundColor: contributionMargin >= 0 ? '#10B981' : '#EF4444',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: { dataset: { label?: string }; raw?: unknown }) => {
                        return `${context.dataset.label}: ${formatCurrency(context.raw as number)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => `৳${(Number(value) / 1000).toFixed(0)}k`,
                },
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Break-Even Chart</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-gray-500 mb-2">Revenue Comparison</p>
                    <div className="h-32">
                        <Bar data={revenueData} options={options} />
                    </div>
                </div>

                <div>
                    <p className="text-sm text-gray-500 mb-2">Cost Structure</p>
                    <div className="h-32">
                        <Bar data={costData} options={options} />
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-xs text-gray-500">Fixed Costs</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(fixedCosts)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Variable Costs</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(variableCosts)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Contribution Margin</p>
                    <p className={`text-sm font-semibold ${contributionMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(contributionMargin)}
                    </p>
                </div>
            </div>
        </div>
    );
}
