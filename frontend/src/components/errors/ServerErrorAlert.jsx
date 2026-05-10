import React from 'react';
import { ServerCrash, RefreshCcw } from 'lucide-react';

/**
 * Handles 500 Internal Server errors and generic failures.
 */
const ServerErrorAlert = ({ error }) => {
  return (
    <div className="bg-red-600 border border-red-700 rounded-2xl p-5 font-sans animate-in fade-in slide-in-from-top-2 duration-300 text-white">
      <div className="flex items-start gap-4">
        <div className="bg-red-700/50 p-2 rounded-xl shrink-0">
          <ServerCrash size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black uppercase tracking-widest mb-1">System Error</h4>
          <p className="text-sm font-medium opacity-90 leading-relaxed">
            {error?.message || "Our servers encountered an unexpected problem. We are working to resolve this as soon as possible."}
          </p>
          
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60">
            <RefreshCcw size={12} />
            Please try again in a few moments.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorAlert;
