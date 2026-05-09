import React from 'react';
import { Calendar, User as UserIcon, Clock } from 'lucide-react';

const AssetHistoryTimeline = ({ history = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-slate-50 rounded-xl border border-outline-variant"></div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-outline-variant font-sans">
        <p className="text-sm text-text-body font-medium opacity-60">No allocation history found for this asset.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-outline-variant font-sans">
      {history.map((entry, index) => (
        <div key={entry.id || entry.allocationId || index} className="relative">
          {/* Dot */}
          <div className={`
            absolute -left-[27px] top-2 w-3.5 h-3.5 rounded-full border-2 bg-white shadow-sm transition-colors
            ${!entry.deallocatedAt ? 'border-primary' : 'border-outline-variant'}
          `}>
            {!entry.deallocatedAt && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary m-auto mt-0.5 animate-pulse"></div>
            )}
          </div>

          <div className={`
            p-4 rounded-xl border transition-all duration-200
            ${!entry.deallocatedAt 
              ? 'bg-primary-light/30 border-primary shadow-sm' 
              : 'bg-white border-outline-variant opacity-70'}
          `}>
            <div className="flex justify-between items-start mb-1">
              <div className="text-sm font-bold text-text-heading flex items-center gap-2">
                <UserIcon size={14} className={!entry.deallocatedAt ? 'text-primary' : 'text-text-body'} />
                {entry.assignedTo?.fullName || 'Unknown Member'}
              </div>
              {!entry.deallocatedAt && (
                <span className="text-[10px] font-extrabold tracking-widest bg-primary text-white px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            
            <p className="text-xs text-text-body font-medium mb-3">
              {entry.assignedTo?.role?.replace('ROLE_', '') || 'Member'}
            </p>

            <div className="flex flex-wrap gap-4 items-center pt-3 border-t border-outline-variant/30">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-body uppercase tracking-tight">
                <Calendar size={12} className="opacity-50" />
                {new Date(entry.allocatedAt).toLocaleDateString()} — {entry.deallocatedAt ? new Date(entry.deallocatedAt).toLocaleDateString() : 'Present'}
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-body uppercase tracking-tight">
                <Clock size={12} className="opacity-50" />
                {entry.durationDays || 0} Days
              </div>
            </div>

            {entry.notes && (
              <div className="mt-3 text-[11px] text-text-body italic bg-slate-50 p-2 rounded-lg border border-outline-variant/20">
                "{entry.notes}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetHistoryTimeline;
