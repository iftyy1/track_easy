'use client';

import { Lightbulb } from 'lucide-react';

interface InsightsSummaryProps {
    summary: string;
    insights: string[];
}

export default function InsightsSummary({ summary, insights }: InsightsSummaryProps) {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">AI Insights</h3>
            </div>

            <p className="text-gray-200 leading-relaxed mb-6">{summary}</p>

            {insights.length > 0 && (
                <div className="space-y-3">
                    {insights.map((insight, index) => (
                        <div key={index} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                            </span>
                            <p className="text-gray-300 text-sm">{insight}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
