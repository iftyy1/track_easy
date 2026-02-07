'use client';

import { createProductionBatchAction } from '@/app/actions/production';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Material {
    id: string;
    name: string;
    unit: string;
}

export function NewBatchForm({ materials }: { materials: Material[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [materialsUsed, setMaterialsUsed] = useState<{ materialId: string; quantityUsed: number }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const addMaterialRow = () => {
        if (materials.length > 0) {
            setMaterialsUsed([...materialsUsed, { materialId: materials[0].id, quantityUsed: 0 }]);
        }
    };

    const removeMaterialRow = (index: number) => {
        const newRows = [...materialsUsed];
        newRows.splice(index, 1);
        setMaterialsUsed(newRows);
    };

    const updateMaterialRow = (index: number, field: 'materialId' | 'quantityUsed', value: string | number) => {
        const newRows = [...materialsUsed];
        newRows[index] = { ...newRows[index], [field]: value };
        setMaterialsUsed(newRows);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            productId: formData.get('productId') as string,
            quantityProduced: parseFloat(formData.get('quantityProduced') as string),
            laborCost: parseFloat(formData.get('laborCost') as string),
            overheadCost: parseFloat(formData.get('overheadCost') as string),
            productionDate: formData.get('productionDate') as string,
            materialsUsed: materialsUsed
        };

        const result = await createProductionBatchAction(data);
        setIsSubmitting(false);
        if (result.success) {
            setIsOpen(false);
            setMaterialsUsed([]);
            router.refresh(); // Ensure list updates
        } else {
            alert('Failed to create batch');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
            >
                <Plus size={16} />
                New Production Batch
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900">Record Production Batch</h3>
                <button onClick={() => setIsOpen(false)} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name/ID</label>
                        <input
                            type="text"
                            name="productId"
                            placeholder="e.g. T-Shirt Black XL"
                            required
                            className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Produced</label>
                        <input
                            type="number"
                            name="quantityProduced"
                            step="1"
                            required
                            className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (৳)</label>
                        <input
                            type="number"
                            name="laborCost"
                            step="0.01"
                            defaultValue="0"
                            required
                            className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Cost (৳)</label>
                        <input
                            type="number"
                            name="overheadCost"
                            step="0.01"
                            defaultValue="0"
                            required
                            className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            name="productionDate"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Materials Used</label>
                        <button
                            type="button"
                            onClick={addMaterialRow}
                            className="text-xs flex items-center gap-1 text-black font-medium hover:underline"
                        >
                            <Plus size={14} /> Add Material
                        </button>
                    </div>

                    {materialsUsed.map((row, index) => {
                        const selectedMat = materials.find(m => m.id === row.materialId);
                        return (
                            <div key={index} className="flex gap-2 mb-2 items-center">
                                <select
                                    value={row.materialId}
                                    onChange={(e) => updateMaterialRow(index, 'materialId', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-50 text-black border border-gray-200 rounded-lg text-sm"
                                >
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={row.quantityUsed}
                                    onChange={(e) => updateMaterialRow(index, 'quantityUsed', parseFloat(e.target.value))}
                                    className="w-24 px-3 py-2 bg-gray-50 text-black border border-gray-200 rounded-lg text-sm"
                                    step="0.01"
                                />
                                <span className="text-xs text-gray-500 w-8">{selectedMat?.unit}</span>
                                <button type="button" onClick={() => removeMaterialRow(index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                    {materialsUsed.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No materials added to this batch.</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Calculating & Saving...' : 'Save Production Batch'}
                </button>
            </form>
        </div>
    );
}
