import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { FinancialsService } from "@/server/financials/financials-aggregator.service";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const asOfDate = searchParams.get("asOfDate");

    if (!asOfDate) {
        return NextResponse.json({ error: "Missing asOfDate" }, { status: 400 });
    }

    try {
        const data = await FinancialsService.getBalanceSheet(
            session.user.id,
            new Date(asOfDate)
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
