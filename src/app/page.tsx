import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";



export default async function LandingPage() {
  const session: Session | null = await getServerSession(authOptions);
  return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Effortless Order Tracking for Your Business
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Create, share, and track orders with a single link. Streamline your workflow and give your customers real-time updates.
        </p>

        {session && (
          <div className="flex gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              View All Orders
            </Link>
            <Link
              href="/order/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Create New Order
            </Link>
          </div>
        )}
      </div>

        <section className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-center mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold mb-2">1. Fill Order Info</h3>
              <p className="text-gray-600">Add the customer name, address, phone, and product name.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold mb-2">2. Get Shareable Link</h3>
              <p className="text-gray-600">A unique link is generated for each order.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold mb-2">3. Customer Tracks Status</h3>
              <p className="text-gray-600">Customers see real-time updates on their order status.</p>
            </div>
          </div>
        </section>
      </main>
  );
}
