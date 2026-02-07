'use client';

import { useState, useEffect } from 'react';

interface CashFlowData {
    cashIn: number;
    cashOut: number;
    netCashFlow: number;
    breakdown: {
        inflows: {
            sales: number;
        };
        outflows: {
            expenses: number;
            materials: number;
            labor: number;
        };
    };
}

export default function CashFlowView() {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            const res = await fetch(`/api/financials/cash-flow?startDate=${startDate}&endDate=${endDate}`);
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

    if (loading && !data) return <div>Loading Cash Flow...</div>;

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-serif font-medium uppercase">Cash In (Inflows)</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(data.cashIn)}</p>
                        <p className="text-sm text-gray-500 mt-1">Sales: {formatCurrency(data.breakdown.inflows.sales)}</p>
                    </div>

                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-serif font-medium uppercase">Cash Out (Outflows)</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(data.cashOut)}</p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>Expenses: {formatCurrency(data.breakdown.outflows.expenses)}</p>
                            <p>Materials: {formatCurrency(data.breakdown.outflows.materials)}</p>
                            <p>Labor: {formatCurrency(data.breakdown.outflows.labor)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-serif font-medium uppercase">Net Cash Flow</h3>
                        <p className={`mt-2 text-3xl font-bold ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(data.netCashFlow)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
