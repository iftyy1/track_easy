import { NextResponse } from 'next/server';
import { recordPurchase } from '@/server/accounting/inventory.service';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { materialId, quantity, totalCost, purchaseDate } = body;

        if (!materialId || !quantity || !totalCost || !purchaseDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await recordPurchase({
            userId: session.user.id,
            materialId,
            quantity: Number(quantity),
            totalCost: Number(totalCost),
            purchaseDate: new Date(purchaseDate),
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Purchase error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
