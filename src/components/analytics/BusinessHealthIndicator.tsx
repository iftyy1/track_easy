'use client';

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

type HealthLevel = 'healthy' | 'moderate' | 'at-risk';

interface HealthIndicator {
    category: string;
    level: HealthLevel;
    label: string;
}

interface BusinessHealthIndicatorProps {
    overall: HealthLevel;
    indicators: HealthIndicator[];
}

const HEALTH_CONFIG: Record<HealthLevel, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    'healthy': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Healthy',
    },
    'moderate': {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: <AlertCircle className="w-5 h-5" />,
        label: 'Moderate',
    },
    'at-risk': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircle className="w-5 h-5" />,
        label: 'At Risk',
    },
};

export default function BusinessHealthIndicator({ overall, indicators }: BusinessHealthIndicatorProps) {
    const overallConfig = HEALTH_CONFIG[overall];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Business Health</h3>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${overallConfig.bg} ${overallConfig.border} mb-6`}>
                <div className={overallConfig.text}>{overallConfig.icon}</div>
                <div>
                    <p className={`font-semibold ${overallConfig.text}`}>Overall: {overallConfig.label}</p>
                    <p className="text-sm text-gray-600">Based on {indicators.length} health indicators</p>
                </div>
            </div>

            <div className="space-y-3">
                {indicators.map((indicator, index) => {
                    const config = HEALTH_CONFIG[indicator.level];
                    return (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${config.bg}`}>
                                    <div className={config.text} style={{ transform: 'scale(0.7)' }}>
                                        {config.icon}
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{indicator.category}</span>
                            </div>
                            <span className={`text-sm font-medium px-2 py-1 rounded ${config.bg} ${config.text}`}>
                                {indicator.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
