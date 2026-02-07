'use client';

import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

type MarketingVerdict = 'strong' | 'average' | 'unprofitable' | 'no-data';

interface MarketingPerformanceProps {
    adSpend: number;
    revenue: number;
    roas: number;
    verdict: MarketingVerdict;
    verdictLabel: string;
}

export default function MarketingPerformance({
    adSpend,
    revenue,
    roas,
    verdict,
    verdictLabel,
}: MarketingPerformanceProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(val);

    const getVerdictStyles = () => {
        switch (verdict) {
            case 'strong':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    icon: <TrendingUp className="w-5 h-5" />,
                };
            case 'average':
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    icon: <Target className="w-5 h-5" />,
                };
            case 'unprofitable':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    icon: <TrendingDown className="w-5 h-5" />,
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-600',
                    border: 'border-gray-200',
                    icon: <AlertTriangle className="w-5 h-5" />,
                };
        }
    };

    const styles = getVerdictStyles();

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Marketing Performance</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Ad Spend</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(adSpend)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Revenue</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">ROAS</p>
                    <p className="text-xl font-bold text-gray-900">
                        {roas > 0 ? `${roas.toFixed(1)}x` : '—'}
                    </p>
                </div>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
                <div className={styles.text}>{styles.icon}</div>
                <span className={`font-medium ${styles.text}`}>{verdictLabel}</span>
            </div>
        </div>
    );
}
