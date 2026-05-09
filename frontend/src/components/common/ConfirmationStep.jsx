import React from 'react';
import { AlertCircle, ArrowRight, User as UserIcon, Laptop } from 'lucide-react';
import Button from './Button';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const ConfirmationStep = ({ user, asset, onConfirm, onCancel, loading, error }) => {
  return (
    <div className="space-y-8 py-4 font-sans pb-10">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
          <ArrowRight size={32} />
        </div>
        <h3 className="text-2xl font-black text-text-heading tracking-tight">Verify Reallocation</h3>
        <p className="text-text-body mt-2 max-w-xs font-medium opacity-70">
          You are about to transfer custody of this asset. Please review the details carefully.
        </p>
      </div>

      {error && <GlobalErrorAlert error={error} />}

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-outline-variant shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-outline-variant/50 text-text-body">
            <Laptop size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Asset Identification</span>
            <span className="text-sm font-bold text-text-heading">{asset}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 p-5 bg-primary-light/30 rounded-3xl border border-primary/20 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-primary/10 text-primary">
            <UserIcon size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-0.5">Incoming Custodian</span>
            <span className="text-sm font-bold text-primary">{user?.name || user?.fullName}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-5 flex gap-4 border border-amber-200/50">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-900 font-bold leading-relaxed m-0">
          This operation will immediately close any previous allocation records for this hardware.
        </p>
      </div>

      <div className="flex gap-3 pt-6 border-t border-outline-variant">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading} 
          className="flex-1 !py-4 rounded-2xl font-bold"
        >
          Modify Details
        </Button>
        <Button 
          variant="primary" 
          onClick={onConfirm} 
          loading={loading} 
          disabled={loading} 
          className="flex-[2] !py-4 rounded-2xl shadow-2xl shadow-primary/20 font-bold"
        >
          Confirm Transfer
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
