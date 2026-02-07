import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    getMonthlyBusinessSummary,
    compareMonths,
    getMarketingPerformance,
    getBusinessHealth,
    generateBusinessInsights,
} from '@/server/analytics/analytics.service';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '', 10);

    try {
        const [summary, comparison, marketingPerf] = await Promise.all([
            getMonthlyBusinessSummary(session.user.id, month, year),
            compareMonths(session.user.id, month, year),
            getMarketingPerformance(session.user.id, month, year),
        ]);

        const health = getBusinessHealth(summary, comparison);
        const insights = generateBusinessInsights(summary, comparison, marketingPerf);

        return NextResponse.json({
            summary,
            comparison,
            marketingPerf,
            health,
            insights,
        });
    } catch (error) {
        console.error('Error fetching business insights:', error);
        return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
}
