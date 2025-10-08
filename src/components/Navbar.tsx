'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold text-blue-600">
        TrackEasy
      </Link>

      <div className="flex items-center gap-4">
        {status === 'loading' ? (
          <p>Loading...</p>
        ) : session?.user ? (
          <>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              All Orders
            </Link>
            <Link
              href="/order/new"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
            >
              New Order
            </Link>
            <span className="text-gray-700">Welcome, {session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
