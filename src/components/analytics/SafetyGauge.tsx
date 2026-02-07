'use client';

type SafetyStatus = 'very-safe' | 'safe' | 'moderate' | 'risky' | 'loss';

interface SafetyGaugeProps {
    safetyMarginPercent: number;
    status: SafetyStatus;
}

export default function SafetyGauge({ safetyMarginPercent, status }: SafetyGaugeProps) {
    // Normalize the percentage for the gauge (cap at -50 to 50 for display)
    const normalizedPercent = Math.max(-50, Math.min(50, safetyMarginPercent));
    // Convert to 0-100 scale where 50 is break-even
    const gaugeValue = ((normalizedPercent + 50) / 100) * 100;

    const getGaugeColor = () => {
        switch (status) {
            case 'very-safe': return 'from-green-400 to-green-600';
            case 'safe': return 'from-emerald-400 to-emerald-600';
            case 'moderate': return 'from-yellow-400 to-yellow-600';
            case 'risky': return 'from-orange-400 to-orange-600';
            case 'loss': return 'from-red-400 to-red-600';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'very-safe': return 'Very Safe';
            case 'safe': return 'Safe';
            case 'moderate': return 'Moderate';
            case 'risky': return 'Risky';
            case 'loss': return 'Loss Zone';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Safety Gauge</h3>

            {/* Gauge Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Loss</span>
                <span>Risk</span>
                <span>Safe</span>
                <span>Very Safe</span>
            </div>

            {/* Gauge Track */}
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 opacity-30" />

                {/* Break-even marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-600 transform -translate-x-1/2 z-10" />

                {/* Current position indicator */}
                <div
                    className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${getGaugeColor()} transition-all duration-500`}
                    style={{ width: `${gaugeValue}%` }}
                />

                {/* Pointer */}
                <div
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-y-1/2 -translate-x-1/2 transition-all duration-500 z-20"
                    style={{ left: `${gaugeValue}%` }}
                />
            </div>

            {/* Current Status */}
            <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getGaugeColor()}`} />
                <span className="text-sm font-medium text-gray-700">{getStatusLabel()}</span>
                <span className="text-sm text-gray-500">
                    ({safetyMarginPercent >= 0 ? '+' : ''}{safetyMarginPercent.toFixed(1)}%)
                </span>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-500">&lt; 0%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-gray-500">0-10%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-500">10-30%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-500">&gt; 30%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
