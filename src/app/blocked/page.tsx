import Link from 'next/link';

export default function BlockedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Blocked</h1>
                <p className="text-gray-600 mb-6">
                    Your account has been blocked. Please contact support for assistance.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
