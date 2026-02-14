'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import EmployeeSearch from '@/components/EmployeeSearch';
import ResultCard from '@/components/ResultCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { EmployeeResult } from '@/types/employee';

export default function Home() {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmployeeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Warm up cache on page load
  React.useEffect(() => {
    fetch('/api/warmup').catch(() => {
      // Silently fail if warmup doesn't work
    });
  }, []);

  const handleSearch = async (id: string) => {
    setLoading(true);
    setResult(null);
    setEmployeeId(id);

    try {
      const response = await fetch(`/api/employee?id=${encodeURIComponent(id)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employee data');
      }

      setResult(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to check eligibility',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (mobile: string, isNewEntry: boolean) => {
    setSaving(true);

    try {
      const response = await fetch('/api/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          mobile,
          isNewEntry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save mobile number');
      }

      setToast({
        message: 'Mobile number saved successfully!',
        type: 'success',
      });

      // Update the result with the new mobile number
      if (result) {
        setResult({
          ...result,
          mobile,
        });
      }
    } catch (error) {
      console.error('Error saving mobile:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to save mobile number',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="HABIT Health - Powered by HCL Healthcare"
              width={450}
              height={80}
              priority
              className="h-16 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Employee Eligibility Checker
          </h1>
          <p className="text-neutral-600">
            Verify eligibility status and manage contact information
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-6">
          <EmployeeSearch onSearch={handleSearch} loading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <ResultCard
            result={result}
            employeeId={employeeId}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} HABIT Health. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          autoClose={toast.type === 'success'}
        />
      )}
    </div>
  );
}
