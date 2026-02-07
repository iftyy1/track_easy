'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

type ChangeStatus = 'up' | 'down' | 'unchanged' | 'warning';

interface MetricComparison {
    metric: string;
    current: number;
    last: number;
    changePercent: number;
    status: ChangeStatus;
}

interface MonthComparisonTableProps {
    comparisons: MetricComparison[];
    currentMonth: { month: number; year: number };
    lastMonth: { month: number; year: number };
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthComparisonTable({
    comparisons,
    currentMonth,
    lastMonth,
}: MonthComparisonTableProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);

    const getStatusIcon = (status: ChangeStatus) => {
        switch (status) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getChangeClass = (status: ChangeStatus, changePercent: number) => {
        if (status === 'warning') return 'text-yellow-600';
        if (changePercent > 0) return 'text-green-600';
        if (changePercent < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-black">Month-over-Month Comparison</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metric
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {MONTH_NAMES[currentMonth.month - 1]} {currentMonth.year}
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {MONTH_NAMES[lastMonth.month - 1]} {lastMonth.year}
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Change
                            </th>
                            <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {comparisons.map((comp) => (
                            <tr key={comp.metric} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {comp.metric}
                                </td>
                                <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                                    {comp.metric === 'Orders' ? comp.current : formatCurrency(comp.current)}
                                </td>
                                <td className="px-6 py-4 text-sm text-right text-gray-500">
                                    {comp.metric === 'Orders' ? comp.last : formatCurrency(comp.last)}
                                </td>
                                <td className={`px-6 py-4 text-sm text-right font-medium ${getChangeClass(comp.status, comp.changePercent)}`}>
                                    {comp.changePercent > 0 ? '+' : ''}{comp.changePercent.toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {getStatusIcon(comp.status)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
