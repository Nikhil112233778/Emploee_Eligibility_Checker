'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface EmployeeSearchProps {
  onSearch: (employeeId: string) => void;
  loading: boolean;
}

export default function EmployeeSearch({ onSearch, loading }: EmployeeSearchProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = employeeId.trim();

    if (!trimmedId) {
      setError('Please enter an Employee ID');
      return;
    }

    setError('');
    onSearch(trimmedId);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-neutral-700 mb-2">
            Employee ID
          </label>
          <div className="relative">
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              placeholder="Enter employee ID (e.g., PS123456)"
              className={`w-full h-12 px-4 pr-12 rounded-lg border ${
                error
                  ? 'border-error focus:border-error focus:ring-error/20'
                  : 'border-neutral-300 focus:border-primary focus:ring-primary/20'
              } focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-900 placeholder:text-neutral-400`}
              disabled={loading}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Checking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Check Eligibility
            </>
          )}
        </button>
      </div>
    </form>
  );
}
