import { NextResponse } from 'next/server';
import { recordProduction } from '@/server/accounting/inventory.service';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, quantityProduced, laborCost, overheadCost, productionDate, materialsUsed } = body;

        if (!productId || !quantityProduced || !productionDate || !materialsUsed) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await recordProduction({
            userId: session.user.id,
            productId,
            quantityProduced: Number(quantityProduced),
            laborCost: Number(laborCost || 0),
            overheadCost: Number(overheadCost || 0),
            productionDate: new Date(productionDate),
            materialsUsed,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Production error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
