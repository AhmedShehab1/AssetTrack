import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const GlobalErrorAlert = ({ error, message, onDismiss, onClose, className = '' }) => {
  const displayMessage = message || error?.message || 'An unexpected error occurred.';
  const handleClose = onDismiss || onClose;

  return (
    <div className={`flex items-center justify-between p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 ${className}`} role="alert">
      <div className="flex items-center">
        <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
        <span className="sr-only">Error</span>
        <div>
          <span className="font-medium">{displayMessage}</span>
        </div>
      </div>
      {handleClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex items-center justify-center h-8 w-8"
          onClick={handleClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default GlobalErrorAlert;
