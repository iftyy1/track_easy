'use client';

import { useState } from 'react';
import { createPurchaseAction, deleteMaterialAction } from '@/app/actions/materials';
import { Plus, Trash2 } from 'lucide-react';

interface Material {
    id: string;
    name: string;
    unit: string;
    createdAt: Date | null;
}

interface Purchase {
    id: string;
    materialId: string;
    quantity: string;
    totalCost: string;
    purchaseDate: string;
}

export function MaterialsList({ materials, purchases }: { materials: Material[], purchases: Purchase[] }) {
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => {
                    const materialPurchases = purchases.filter(p => p.materialId === material.id);
                    const totalQty = materialPurchases.reduce((acc, p) => acc + parseFloat(p.quantity), 0);
                    const totalSpent = materialPurchases.reduce((acc, p) => acc + parseFloat(p.totalCost), 0);
                    const avgCost = totalQty > 0 ? totalSpent / totalQty : 0;

                    return (
                        <div key={material.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg text-gray-900">{material.name}</h3>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this material?')) {
                                                    await deleteMaterialAction(material.id);
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete Material"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">Unit: {material.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-black">Avg Cost</p>
                                    <p className="text-lg font-bold text-black">৳{avgCost.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">Inventory History</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-800">Purchased</span>
                                    <span className="font-medium text-black">{totalQty} {material.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-800">Total Spent</span>
                                    <span className="font-medium text-black">৳{totalSpent.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedMaterialId(material.id === selectedMaterialId ? null : material.id)}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-black bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Record Purchase
                            </button>

                            {selectedMaterialId === material.id && (
                                <form action={async (formData) => {
                                    await createPurchaseAction(formData);
                                    // optional: could add client-side feedback here
                                }} className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                    <input type="hidden" name="materialId" value={material.id} />
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity ({material.unit})</label>
                                        <input type="number" step="0.01" name="quantity" required className="w-full px-3 py-2 text-sm bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Cost (৳)</label>
                                        <input type="number" step="0.01" name="totalCost" required className="w-full px-3 py-2 text-sm bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                        <input type="date" name="purchaseDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 text-sm bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                                    </div>
                                    <button type="submit" className="w-full py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900">
                                        Save Purchase
                                    </button>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
