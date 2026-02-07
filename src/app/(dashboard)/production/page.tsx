import { getProductionBatchesAction } from '@/app/actions/production';
import { getMaterialsAction } from '@/app/actions/materials';
import { ProductionList } from '@/components/accounting/ProductionList';
import { NewBatchForm } from '@/components/accounting/NewBatchForm';

export default async function ProductionPage() {
    const batches = await getProductionBatchesAction();
    const materials = await getMaterialsAction();

    // Serialize
    const serializedBatches = batches.map(b => ({
        ...b,
        quantityProduced: b.quantityProduced.toString(),
        laborCost: b.laborCost.toString(),
        overheadCost: b.overheadCost.toString(),
        totalBatchCost: b.totalBatchCost.toString(),
        unitCost: b.unitCost.toString(),
        productionDate: b.productionDate.toString(),
        createdAt: b.createdAt
    }));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Production</h1>
                    <p className="text-gray-500 mt-1">Track manufacturing batches and calculate unit costs</p>
                </div>
                <NewBatchForm materials={materials} />
            </div>

            <ProductionList batches={serializedBatches} />
        </div>
    );
}
