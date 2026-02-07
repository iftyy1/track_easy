'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserRole } from '@/types/next-auth';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Factory,
    ScrollText,
    LineChart,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    userName: string | null | undefined;
    userRole: UserRole;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/orders', label: 'All Orders', icon: Package },
    { href: '/order/new', label: 'New Order', icon: PlusCircle },
];

const accountingItems = [
    { href: '/materials', label: 'Materials', icon: ScrollText },
    { href: '/production', label: 'Production', icon: Factory },
    { href: '/financials', label: 'Financials', icon: LineChart },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
];

const adminItems = [
    { href: '/admin/users', label: 'Manage Users', icon: Users },
];

export default function Sidebar({ userName, userRole }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (href: string) => pathname === href;

    return (
        <aside
            className={`bg-white border-r border-gray-100 h-screen flex flex-col sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className={`p-6 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <Link href="/dashboard" className="text-2xl font-serif font-bold tracking-tight text-black flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" />
                        <span>TrackEasy.</span>
                    </Link>
                ) : (
                    <Link href="/dashboard" className="text-black">
                        <ShoppingBag className="w-8 h-8" />
                    </Link>
                )}
            </div>

            <nav className="flex-1 p-3 mt-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.href)
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${!isActive(item.href) && 'opacity-70 group-hover:opacity-100'}`} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        </li>
                    ))}

                    <li className={`pt-6 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                        <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Accounting
                        </span>
                    </li>
                    {isCollapsed && <div className="my-4 border-t border-gray-100" />}

                    {accountingItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.href)
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${!isActive(item.href) && 'opacity-70 group-hover:opacity-100'}`} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        </li>
                    ))}

                    {userRole === 'admin' && (
                        <>
                            <li className={`pt-6 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                                <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Admin
                                </span>
                            </li>
                            {isCollapsed && userRole === 'admin' && <div className="my-4 border-t border-gray-100" />}

                            {adminItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.href)
                                            ? 'bg-black text-white'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                    >
                                        <item.icon className={`w-5 h-5 flex-shrink-0 ${!isActive(item.href) && 'opacity-70 group-hover:opacity-100'}`} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </nav>

            <div className="p-3 border-t border-gray-100">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full mb-4 flex items-center justify-center p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>

                {!isCollapsed && (
                    <div className="mb-3 px-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="font-medium text-sm truncate text-gray-900">{userName || 'User'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-gray-100 text-gray-600">
                            {userRole}
                        </span>
                    </div>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
