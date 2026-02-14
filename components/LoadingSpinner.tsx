import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-neutral-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-sm text-neutral-600 font-medium">Checking eligibility...</p>
    </div>
  );
}
