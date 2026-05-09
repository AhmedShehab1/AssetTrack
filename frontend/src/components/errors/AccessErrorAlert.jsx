import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

/**
 * Handles 403 Forbidden errors.
 */
const AccessErrorAlert = ({ error }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-sans animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="bg-slate-800 p-2 rounded-xl text-primary shrink-0">
          <Lock size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Access Restricted</h4>
          <p className="text-sm text-slate-400 font-medium opacity-80 leading-relaxed">
            {error?.message || "Your current authority level does not allow performing this administrative action."}
          </p>
          
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
            <ShieldCheck size={12} />
            Contact an administrator to upgrade your role.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessErrorAlert;
