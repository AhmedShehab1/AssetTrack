import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Handles 400 Bad Request errors, specifically displaying field-level validation errors.
 */
const ValidationErrorAlert = ({ error, onDismiss }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const fieldErrors = error?.fieldErrors || [];

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 font-sans animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-2 rounded-xl text-red-600 shrink-0">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Validation Failed</h4>
          <p className="text-sm text-red-800 font-medium opacity-80 leading-relaxed">
            {error?.message || 'Some information provided is invalid. Please check the highlights below.'}
          </p>
          
          {fieldErrors.length > 0 && (
            <div className="mt-4">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-[10px] font-black text-red-700 uppercase tracking-widest hover:underline"
              >
                {showDetails ? 'Hide Details' : `Show ${fieldErrors.length} Errors`}
                {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              
              {showDetails && (
                <ul className="mt-3 space-y-2 p-0 m-0">
                  {fieldErrors.map((fe, idx) => (
                    <li key={idx} className="flex flex-col text-[11px] bg-white/50 p-2 rounded-lg border border-red-100">
                      <span className="font-bold text-red-900 uppercase tracking-tighter">{fe.field}</span>
                      <span className="text-red-700 opacity-70">{fe.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorAlert;
