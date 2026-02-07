import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    if (session.user.role === 'blocked') {
        redirect('/blocked');
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar userName={session.user.name} userRole={session.user.role} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
