'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/updateUserRole';
import { UserRole } from '@/types/next-auth';

interface UserRoleDropdownProps {
    userId: string;
    currentRole: UserRole;
    isCurrentUser: boolean;
}

const roleOptions: { value: UserRole; label: string; color: string }[] = [
    { value: 'admin', label: 'Admin', color: 'bg-black text-white' },
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' },
    { value: 'blocked', label: 'Blocked', color: 'bg-white border border-gray-200 text-gray-400 line-through' },
];

export default function UserRoleDropdown({ userId, currentRole, isCurrentUser }: UserRoleDropdownProps) {
    const [role, setRole] = useState<UserRole>(currentRole);
    const [isUpdating, setIsUpdating] = useState(false);

    const currentOption = roleOptions.find(opt => opt.value === role) || roleOptions[1];

    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        if (newRole === role) return;

        setIsUpdating(true);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                setRole(newRole);
            } else {
                alert(result.error || 'Failed to update role');
            }
        } catch {
            alert('Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isCurrentUser) {
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${currentOption.color}`}>
                {currentOption.label} (You)
            </span>
        );
    }

    return (
        <select
            value={role}
            onChange={handleRoleChange}
            disabled={isUpdating}
            className={`px-3 py-1 text-sm font-medium rounded-lg border-0 cursor-pointer ${currentOption.color} ${isUpdating ? 'opacity-50' : ''}`}
        >
            {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
