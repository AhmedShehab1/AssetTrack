import React from 'react';
import ValidationErrorAlert from './ValidationErrorAlert';
import AccessErrorAlert from './AccessErrorAlert';
import ConflictErrorAlert from './ConflictErrorAlert';
import ServerErrorAlert from './ServerErrorAlert';
import NotFoundErrorAlert from './NotFoundErrorAlert';
import { AlertCircle, X } from 'lucide-react';

/**
 * Smart entry-point for API Error visualization.
 * Delegates to specific handlers based on HTTP status code per openapi.yaml.
 */
const GlobalErrorAlert = ({ error, onDismiss, onClose, className = '' }) => {
  if (!error) return null;

  const handleClose = onDismiss || onClose;
  const status = error.status || 500;

  // Render the specific handler component
  const renderSpecificError = () => {
    switch (status) {
      case 400:
        return <ValidationErrorAlert error={error} onDismiss={handleClose} />;
      case 403:
        return <AccessErrorAlert error={error} onDismiss={handleClose} />;
      case 404:
        return <NotFoundErrorAlert error={error} />;
      case 409:
        return <ConflictErrorAlert error={error} onDismiss={handleClose} />;
      case 500:
        return <ServerErrorAlert error={error} onDismiss={handleClose} />;
      default:
        // Fallback for 401 (usually handled by redirect) or 404
        return (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-xl text-red-600 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Error {status}</h4>
              <p className="text-sm text-red-800 font-medium opacity-80 leading-relaxed">
                {error.message || 'An unexpected error occurred.'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {renderSpecificError()}
      
      {handleClose && (
        <button
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default GlobalErrorAlert;

