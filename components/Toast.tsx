import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoClose?: boolean;
}

export default function Toast({ message, type, onClose, autoClose = true }: ToastProps) {
  useEffect(() => {
    if (autoClose && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, type, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
          type === 'success'
            ? 'bg-white border-success text-neutral-900'
            : 'bg-white border-error text-neutral-900'
        }`}
      >
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <XCircle className="w-5 h-5 text-error" />
          )}
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
