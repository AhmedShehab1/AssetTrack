import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

/**
 * Handles 409 Conflict errors (e.g., active allocations, duplicate serials).
 */
const ConflictErrorAlert = ({ error }) => {
  const isUserDeletion = error?.path?.includes('/users/') && error?.status === 409;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 font-sans animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">State Conflict</h4>
          <p className="text-sm text-amber-800 font-medium opacity-80 leading-relaxed">
            {isUserDeletion 
              ? "This account has active or historical asset allocations and cannot be deleted to preserve the audit trail." 
              : error?.message || "The operation could not be completed because the resource is in an incompatible state."}
          </p>
          
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
            <Info size={12} />
            {isUserDeletion ? "Recommendation: Deactivate the account instead." : "Verify requirements and try again."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictErrorAlert;
