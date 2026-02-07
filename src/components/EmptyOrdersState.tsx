import Link from 'next/link';

export default function EmptyOrdersState() {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first order</p>
            <Link
                href="/order/new"
                className="inline-block bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
                Create First Order
            </Link>
        </div>
    );
}
