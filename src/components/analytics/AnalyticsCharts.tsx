'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartDataPoint {
    month: string;
    revenue: number;
    profit: number;
    marketingSpend?: number;
}

interface AnalyticsChartsProps {
    data: ChartDataPoint[];
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    const labels = data.map((d) => d.month);

    const revenueVsProfitData = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: data.map((d) => d.revenue),
                backgroundColor: '#000000',
                borderRadius: 4,
            },
            {
                label: 'Net Profit',
                data: data.map((d) => d.profit),
                backgroundColor: data.map((d) => (d.profit >= 0 ? '#10B981' : '#EF4444')),
                borderRadius: 4,
            },
        ],
    };

    const marketingVsRevenueData = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: data.map((d) => d.revenue),
                borderColor: '#000000',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Marketing Spend',
                data: data.map((d) => d.marketingSpend || 0),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => `৳${Number(value).toLocaleString()}`,
                },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => `৳${Number(value).toLocaleString()}`,
                },
            },
        },
    };

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center h-48 text-gray-400">
                    No chart data available
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-black mb-4">Revenue vs Profit</h3>
                <div className="h-64">
                    <Bar data={revenueVsProfitData} options={barOptions} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-black mb-4">Marketing Spend vs Revenue</h3>
                <div className="h-64">
                    <Line data={marketingVsRevenueData} options={lineOptions} />
                </div>
            </div>
        </div>
    );
}
