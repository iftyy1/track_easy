'use client';

import { useState, useEffect } from 'react';

interface BalanceSheetData {
    assets: {
        cash: number;
        inventory: number;
        otherAssets: number;
        totalAssets: number;
    };
    liabilities: {
        totalLiabilities: number;
    };
    equity: {
        retainedEarnings: number;
        totalEquity: number;
    };
}

export default function BalanceSheetView() {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(false);
    const [asOfDate, setAsOfDate] = useState('');

    useEffect(() => {
        // Default to today
        setAsOfDate(new Date().toISOString().split('T')[0]);
    }, []);

    const fetchData = async () => {
        if (!asOfDate) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/financials/balance-sheet?asOfDate=${asOfDate}`);
            if (res.ok) {
                setData(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [asOfDate]);

    if (loading && !data) return <div>Loading Balance Sheet...</div>;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">As Of Date</label>
                    <input
                        type="date"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white"
                    />
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Assets Column */}
                    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
                        <h3 className="text-xl font-serif font-bold text-black mb-4 border-b border-gray-100 pb-2">Assets</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Cash & Equivalents</dt>
                                <dd className="font-semibold text-gray-900">{formatCurrency(data.assets.cash)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Inventory</dt>
                                <dd className="font-semibold text-gray-900">{formatCurrency(data.assets.inventory)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Other Assets</dt>
                                <dd className="font-semibold text-gray-900">{formatCurrency(data.assets.otherAssets)}</dd>
                            </div>
                            <div className="flex justify-between pt-4 border-t mt-4 bg-gray-50 p-2 -mx-2 rounded">
                                <dt className="font-bold text-gray-900">Total Assets</dt>
                                <dd className="font-bold text-gray-900">{formatCurrency(data.assets.totalAssets)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Liabilities & Equity Column */}
                    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg h-fit">
                        <h3 className="text-xl font-serif font-bold text-black mb-4 border-b border-gray-100 pb-2">Liabilities & Equity</h3>

                        <h4 className="font-serif font-semibold text-gray-800 mt-2 mb-2">Liabilities</h4>
                        <dl className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Total Liabilities</dt>
                                <dd className="font-semibold text-gray-900">{formatCurrency(data.liabilities.totalLiabilities)}</dd>
                            </div>
                        </dl>


                        <h4 className="font-serif font-semibold text-gray-800 mt-4 mb-2">Equity</h4>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Retained Earnings</dt>
                                <dd className="font-semibold text-gray-900">{formatCurrency(data.equity.retainedEarnings)}</dd>
                            </div>
                            <div className="flex justify-between pt-4 border-t mt-4 bg-gray-50 p-2 -mx-2 rounded">
                                <dt className="font-bold text-gray-900">Total Liabilities & Equity</dt>
                                {/* Logic Check: Assets = Liabilities + Equity. So this sum should be equal to Total Assets */}
                                <dd className="font-bold text-gray-900">{formatCurrency(data.liabilities.totalLiabilities + data.equity.totalEquity)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}
