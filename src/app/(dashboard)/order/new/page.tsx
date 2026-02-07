'use client';
import { createOrder } from '@/app/actions/createOrder';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewOrderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await createOrder(formData);
            if (result.success && result.data) {
                router.push(`/order/${result.data.orderId}`);
            } else {
                alert(result.error || 'Failed to create order. Please try again.');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
                    <p className="text-gray-600 mt-1">
                        Fill in the details below to create a new order
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter customer name"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    id="productName"
                                    name="productName"
                                    type="text"
                                    placeholder="Enter product name"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (৳) *
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Address *
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                placeholder="Enter complete delivery address"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-900"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-800 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="h-5 w-5 text-white animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating Order...</span>
                                </>
                            ) : (
                                'Create Order & Generate Tracking Link'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
