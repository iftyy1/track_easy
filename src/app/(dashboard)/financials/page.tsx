'use client';

import { useState } from 'react';
import PnLView from '@/components/financials/PnLView';
import BalanceSheetView from '@/components/financials/BalanceSheetView';
import CashFlowView from '@/components/financials/CashFlowView';

export default function FinancialsPage() {
    const [activeTab, setActiveTab] = useState<'pnl' | 'balanceSheet' | 'cashFlow'>('pnl');

    return (
        <div className="space-y-6 p-8">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pnl')}
                        className={`${activeTab === 'pnl'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-black hover:border-gray-200'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Profit & Loss
                    </button>
                    <button
                        onClick={() => setActiveTab('balanceSheet')}
                        className={`${activeTab === 'balanceSheet'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-black hover:border-gray-200'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Balance Sheet
                    </button>
                    <button
                        onClick={() => setActiveTab('cashFlow')}
                        className={`${activeTab === 'cashFlow'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-black hover:border-gray-200'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Cash Flow
                    </button>
                </nav>
            </div>

            <div className="mt-4">
                {activeTab === 'pnl' && <PnLView />}
                {activeTab === 'balanceSheet' && <BalanceSheetView />}
                {activeTab === 'cashFlow' && <CashFlowView />}
            </div>
        </div>
    );
}
