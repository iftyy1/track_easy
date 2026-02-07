import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { assets } from "@/server/db/schema/financials";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, assetType, amount, recordedDate } = body;

    if (!name || !assetType || !amount || !recordedDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        await db.insert(assets).values({
            userId: session.user.id,
            name,
            assetType,
            amount: String(amount),
            recordedDate: new Date(recordedDate).toISOString().split('T')[0],
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
