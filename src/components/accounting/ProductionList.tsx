'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProductionBatchAction } from '@/app/actions/production';

interface ProductionBatch {
    id: string;
    productId: string;
    quantityProduced: string;
    unitCost: string;
    totalBatchCost: string;
    productionDate: string;
}

export function ProductionList({ batches }: { batches: ProductionBatch[] }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="grid grid-cols-6 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div>Date</div>
                <div>Product</div>
                <div>Qty Produced</div>
                <div>Unit Cost</div>
                <div>Total Cost</div>
                <div className="text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100">
                {batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No production batches found</div>
                ) : (
                    batches.map((batch) => (
                        <div key={batch.id} className="grid grid-cols-6 p-4 hover:bg-gray-50 transition-colors text-sm items-center">
                            <div className="text-gray-600">{new Date(batch.productionDate).toLocaleDateString()}</div>
                            <div className="font-medium text-gray-900">{batch.productId}</div>
                            <div className="text-gray-900">{batch.quantityProduced}</div>
                            <div className="font-mono font-medium text-gray-600">৳{parseFloat(batch.unitCost).toFixed(2)}</div>
                            <div className="font-mono text-gray-600">৳{parseFloat(batch.totalBatchCost).toFixed(2)}</div>
                            <div className="text-right">
                                <button
                                    onClick={async (e) => {
                                        if (confirm('Are you sure you want to delete this batch?')) {
                                            await deleteProductionBatchAction(batch.id);
                                        }
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 inline-flex"
                                    title="Delete Batch"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
