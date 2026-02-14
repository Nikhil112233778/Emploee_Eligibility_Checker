'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Edit2, Save, Phone, AlertCircle } from 'lucide-react';
import { EmployeeResult } from '@/types/employee';

interface ResultCardProps {
  result: EmployeeResult;
  employeeId: string;
  onSave: (mobile: string, isNewEntry: boolean) => void;
  saving: boolean;
}

export default function ResultCard({ result, employeeId, onSave, saving }: ResultCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(result.mobile || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedMobile = mobileNumber.trim();

    if (!trimmedMobile) {
      setError('Please enter a mobile number');
      return;
    }

    // Validate mobile number - must be exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(trimmedMobile)) {
      if (trimmedMobile.length < 10) {
        setError('Mobile number must be 10 digits');
      } else if (trimmedMobile.length > 10) {
        setError('Mobile number cannot be more than 10 digits');
      } else {
        setError('Mobile number must contain only digits');
      }
      return;
    }

    setError('');
    onSave(trimmedMobile, !result.eligible);
    setIsEditing(false);
  };

  // Case C: Not Eligible
  if (!result.eligible) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 animate-fadeInUp">
        {/* Status Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
          <div className="flex-shrink-0 w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900">Not Eligible</h3>
            <p className="text-sm text-neutral-600 mt-0.5">
              Employee ID: <span className="font-mono font-medium text-neutral-900">{employeeId}</span>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-700">
            This employee ID is not currently eligible. You may optionally save a mobile number for future reference.
          </p>
        </div>

        {/* Mobile Number Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="mobile-not-eligible" className="block text-sm font-medium text-neutral-700 mb-2">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="tel"
                id="mobile-not-eligible"
                value={mobileNumber}
                onChange={(e) => {
                  // Only allow digits and limit to 10 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobileNumber(value);
                  setError('');
                }}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={`w-full h-12 pl-11 pr-4 rounded-lg border ${
                  error
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-neutral-300 focus:border-primary focus:ring-primary/20'
                } focus:outline-none focus:ring-2 transition-all duration-200`}
                disabled={saving}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-error">{error}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Mobile Number'}
          </button>
        </div>
      </div>
    );
  }

  // Case A: Eligible with mobile (not editing)
  if (result.mobile && !isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 animate-fadeInUp">
        {/* Status Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
          <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900">Eligible</h3>
            <p className="text-sm text-neutral-600 mt-0.5">
              Employee ID: <span className="font-mono font-medium text-neutral-900">{employeeId}</span>
            </p>
          </div>
        </div>

        {/* Mobile Number Display */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Mobile Number
                </p>
                <p className="text-lg font-mono font-semibold text-neutral-900">
                  {result.mobile}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 hover:border-primary transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case A (Edit mode) or Case B: Eligible without mobile
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 animate-fadeInUp">
      {/* Status Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
        <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-neutral-900">Eligible</h3>
          <p className="text-sm text-neutral-600 mt-0.5">
            Employee ID: <span className="font-mono font-medium text-neutral-900">{employeeId}</span>
          </p>
        </div>
      </div>

      {/* Info Box - only show if no mobile and not editing */}
      {!result.mobile && !isEditing && (
        <div className="bg-amber-50 rounded-lg p-4 mb-6 flex items-start gap-3 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            No mobile number on record. Please add one below.
          </p>
        </div>
      )}

      {/* Mobile Number Input */}
      <div className="space-y-4">
        <div>
          <label htmlFor="mobile-eligible" className="block text-sm font-medium text-neutral-700 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="tel"
              id="mobile-eligible"
              value={mobileNumber}
              onChange={(e) => {
                // Only allow digits and limit to 10 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMobileNumber(value);
                setError('');
              }}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className={`w-full h-12 pl-11 pr-4 rounded-lg border ${
                error
                  ? 'border-error focus:border-error focus:ring-error/20'
                  : 'border-neutral-300 focus:border-primary focus:ring-primary/20'
              } focus:outline-none focus:ring-2 transition-all duration-200`}
              disabled={saving}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          {isEditing && result.mobile && (
            <button
              onClick={() => {
                setIsEditing(false);
                setMobileNumber(result.mobile || '');
                setError('');
              }}
              disabled={saving}
              className="flex-1 h-12 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 bg-success hover:bg-success-dark text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Mobile Number'}
          </button>
        </div>
      </div>
    </div>
  );
}
