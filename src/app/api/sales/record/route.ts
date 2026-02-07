import { NextResponse } from 'next/server';
import { recordSale } from '@/server/accounting/inventory.service';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, date, items } = body;

        if (!orderId || !date || !items) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await recordSale({
            userId: session.user.id,
            orderId,
            date: new Date(date),
            items,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sales recording error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
