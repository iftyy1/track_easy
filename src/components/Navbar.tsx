import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold text-blue-600">
        TrackEasy
      </Link>

      <div className="flex items-center gap-4">
        {session?.user ? (
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
            <LogoutButton />
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
