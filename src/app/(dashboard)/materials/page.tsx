import { getMaterialsAction, getPurchasesAction } from '@/app/actions/materials';
import { MaterialsList } from '@/components/accounting/MaterialsList';
import { NewMaterialForm } from '@/components/accounting/NewMaterialForm';

export default async function MaterialsPage() {
    const materials = await getMaterialsAction();
    const purchases = await getPurchasesAction();

    // Serialize dates for client components
    const serializedMaterials = materials.map(m => ({
        ...m,
        createdAt: m.createdAt
    }));

    // Convert numeric strings to strings for props just to be safe, though server action returns match interface
    // but purchaseDate is Date object from DB probably, action might return it as date. 
    // Wait, createPurchaseAction input/output types.
    // getPurchasesAction returns records from DB. purchaseDate is 'date' type in Drizzle (string) or Date depending on config.
    // In schema accounting.ts: purchaseDate: date('purchase_date') -> usually returns string 'YYYY-MM-DD'

    const serializedPurchases = purchases.map(p => ({
        ...p,
        quantity: p.quantity.toString(),
        totalCost: p.totalCost.toString(),
        purchaseDate: p.purchaseDate.toString()
    }));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Materials</h1>
                    <p className="text-gray-500 mt-1">Manage raw materials and purchase history</p>
                </div>
                <NewMaterialForm />
            </div>

            <MaterialsList materials={serializedMaterials} purchases={serializedPurchases} />
        </div>
    );
}
