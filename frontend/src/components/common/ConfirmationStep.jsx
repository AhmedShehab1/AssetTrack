import React from 'react';
import { AlertCircle, ArrowRight, User as UserIcon, Laptop } from 'lucide-react';
import Button from './Button';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const ConfirmationStep = ({ user, asset, onConfirm, onCancel, loading, error }) => {
  return (
    <div className="space-y-8 py-4 font-sans">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
          <ArrowRight size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-heading">Confirm Reallocation</h3>
        <p className="text-text-body mt-2 max-w-xs">
          You are about to move this asset to a new member. Please verify the details below.
        </p>
      </div>

      {error && <GlobalErrorAlert error={error} />}

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-outline-variant">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-outline-variant/50 text-text-body">
            <Laptop size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hardware Asset</span>
            <span className="text-sm font-bold text-text-heading">{asset}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-primary-light/30 rounded-2xl border border-primary/20">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-primary/10 text-primary">
            <UserIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">New Custodian</span>
            <span className="text-sm font-bold text-primary">{user?.name || user?.fullName}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-200/50">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          This action will immediately update the asset's custody record. The previous allocation will be automatically closed.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>Back to Edit</Button>
        <Button variant="primary" onClick={onConfirm} loading={loading} disabled={loading} style={{ flex: 1 }}>Confirm Reallocation</Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
