import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMonthlyBusinessSummary } from '@/server/analytics/analytics.service';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '', 10);

    try {
        const summary = await getMonthlyBusinessSummary(session.user.id, month, year);
        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
        return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
    }
}
