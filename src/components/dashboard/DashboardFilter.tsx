'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function DashboardFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const defaultMonth = (new Date().getMonth() + 1).toString();
    const defaultYear = currentYear.toString();

    return (
        <div className="flex gap-4">
            <select
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5"
                value={searchParams.get('month') || defaultMonth}
                onChange={(e) => updateFilter('month', e.target.value)}
            >
                {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                        {month}
                    </option>
                ))}
            </select>

            <select
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5"
                value={searchParams.get('year') || defaultYear}
                onChange={(e) => updateFilter('year', e.target.value)}
            >
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </div>
    );
}
