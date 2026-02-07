'use client';

import { createMaterialAction } from '@/app/actions/materials';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function NewMaterialForm() {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
            >
                <Plus size={16} />
                New Material
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Add New Material</h3>
                <button onClick={() => setIsOpen(false)} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
            </div>

            <form action={async (formData) => {
                await createMaterialAction(formData);
                setIsOpen(false);
            }} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. Cotton 60 GSM"
                        required
                        className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                        type="text"
                        name="unit"
                        placeholder="e.g. yards, kg"
                        required
                        className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-black text-white font-medium rounded-xl hover:bg-gray-900 transition-colors"
                >
                    Save Material
                </button>
            </form>
        </div>
    );
}
