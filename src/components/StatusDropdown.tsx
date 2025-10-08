'use client';

import { updateOrderStatus } from '@/app/actions/updateOrderStatus';
import { useState, useEffect, useRef } from 'react';

interface StatusDropdownProps {
  orderId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: 'Processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Ready', label: 'Ready', color: 'bg-blue-100 text-blue-800' },
  { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function StatusDropdown({ orderId, currentStatus }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStatusOption = statusOptions.find(option => option.value === status) || statusOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setStatus(newStatus);
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition duration-200 ${currentStatusOption.color} hover:opacity-80 disabled:opacity-50 cursor-pointer`}
      >
        {isUpdating ? 'Updating...' : status}
        <svg className={`ml-1 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute z-50 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="py-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition duration-200 flex items-center text-gray-900 ${
                    option.value === status ? 'bg-gray-50 font-semibold' : ''
                  }`}
                >
                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${option.color.split(' ')[0]}`}></span>
                  <span className="text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
