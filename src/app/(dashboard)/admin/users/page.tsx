import { db } from '@/server/db';
import { users } from '@/server/db/schema/auth-users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import UserRoleDropdown from '@/components/UserRoleDropdown';

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const allUsers = await db.select().from(users);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                <p className="text-gray-600 mt-1">View and manage user roles</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <UserRoleDropdown
                                        userId={user.id}
                                        currentRole={(user.role as 'admin' | 'user' | 'blocked') || 'user'}
                                        isCurrentUser={user.id === session.user.id}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
