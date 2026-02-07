import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema/financials";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, amount, expenseDate, notes } = body;

    if (!category || !amount || !expenseDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        await db.insert(expenses).values({
            userId: session.user.id,
            category,
            amount: String(amount),
            expenseDate: new Date(expenseDate).toISOString().split('T')[0],
            notes,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
