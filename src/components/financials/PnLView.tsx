'use client';

import { useState, useEffect } from 'react';

interface PnLData {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
}

export default function PnLView() {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Default to current month
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    const fetchData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/financials/pnl?startDate=${startDate}&endDate=${endDate}`);
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
    }, [startDate, endDate]);

    if (loading && !data) return <div>Loading P&L...</div>;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white"
                    />
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
                        <h3 className="text-lg font-serif font-medium text-black mb-4">Profit & Loss Summary</h3>
                        <dl className="space-y-4">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-gray-600">Revenue</dt>
                                <dd className="font-semibold text-black">{formatCurrency(data.revenue)}</dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-gray-600">Cost of Goods Sold (COGS)</dt>
                                <dd className="font-semibold text-red-600">-{formatCurrency(data.cogs)}</dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2 bg-gray-50 p-2 rounded">
                                <dt className="font-medium text-black">Gross Profit</dt>
                                <dd className="font-bold text-black">{formatCurrency(data.grossProfit)}</dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-gray-600">Operating Expenses</dt>
                                <dd className="font-semibold text-red-600">-{formatCurrency(data.expenses)}</dd>
                            </div>
                            <div className="flex justify-between pt-2 border-t-2 border-gray-100">
                                <dt className="text-lg font-serif font-bold text-black">Net Profit</dt>
                                <dd className={`text-lg font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.netProfit)}
                                </dd>
                            </div>
                            <div className="flex justify-between pt-1">
                                <dt className="text-sm text-gray-500">Profit Margin</dt>
                                <dd className="text-sm font-medium text-gray-900">{data.profitMargin.toFixed(2)}%</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}
