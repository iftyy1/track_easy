'use client';

import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

type SafetyStatus = 'very-safe' | 'safe' | 'moderate' | 'risky' | 'loss';

interface BreakEvenCardProps {
    breakEvenRevenue: number;
    actualRevenue: number;
    safetyMargin: number;
    safetyMarginPercent: number;
    status: SafetyStatus;
    statusLabel: string;
    breakEvenUnits: number;
    unitsSold: number;
}

const STATUS_CONFIG: Record<SafetyStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    'very-safe': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    'safe': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    'moderate': {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: <Target className="w-5 h-5" />,
    },
    'risky': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    'loss': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <TrendingDown className="w-5 h-5" />,
    },
};

export default function BreakEvenCard({
    breakEvenRevenue,
    actualRevenue,
    safetyMargin,
    safetyMarginPercent,
    status,
    statusLabel,
    breakEvenUnits,
    unitsSold,
}: BreakEvenCardProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);

    const config = STATUS_CONFIG[status];
    const isAboveBreakEven = safetyMargin >= 0;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Break-Even Analysis</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.border} border`}>
                    <span className={config.text}>{config.icon}</span>
                    <span className={`text-sm font-medium ${config.text}`}>{statusLabel}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Break-Even Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(breakEvenRevenue)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Actual Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(actualRevenue)}</p>
                </div>
            </div>

            <div className={`p-4 rounded-lg ${isAboveBreakEven ? 'bg-green-50' : 'bg-red-50'} mb-4`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${isAboveBreakEven ? 'text-green-600' : 'text-red-600'}`}>
                            {isAboveBreakEven ? 'Above Break-Even' : 'Below Break-Even'}
                        </p>
                        <p className={`text-xl font-bold ${isAboveBreakEven ? 'text-green-700' : 'text-red-700'}`}>
                            {isAboveBreakEven ? '+' : ''}{formatCurrency(safetyMargin)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm ${isAboveBreakEven ? 'text-green-600' : 'text-red-600'}`}>Safety Margin</p>
                        <p className={`text-xl font-bold ${isAboveBreakEven ? 'text-green-700' : 'text-red-700'}`}>
                            {safetyMarginPercent.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {breakEvenUnits > 0 && (
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-2">Unit Break-Even</p>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">
                            Need to sell <span className="font-semibold">{breakEvenUnits}</span> units
                        </span>
                        <span className={`font-semibold ${unitsSold >= breakEvenUnits ? 'text-green-600' : 'text-red-600'}`}>
                            Sold: {unitsSold}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
