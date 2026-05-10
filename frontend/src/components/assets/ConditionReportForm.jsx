import React, { useState } from 'react';
import { AlertCircle, Send, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useConditionReports } from '../../hooks/api/useConditionReports';
import Button from '../common/Button';
import Card from '../common/Card';
import { ConditionSeverity } from '../../api/types';

const ConditionReportForm = ({ assetId, assetName, onComplete, onCancel }) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(ConditionSeverity.MEDIUM);
  const [isSuccess, setIsSuccess] = useState(false);
  const { createReport, creating, createError, clearError } = useConditionReports(assetId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createReport({
      description: description.trim(),
      severity
    });
    
    if (result) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-heading mb-2">Report Submitted</h3>
        <p className="text-text-body text-sm mb-8 max-w-xs mx-auto">
          Thank you. Our technical team has been notified about the issue with <strong>{assetName}</strong>.
        </p>
        <Button variant="primary" onClick={onComplete} className="w-full">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl flex items-start gap-3">
        <div className="mt-1">
          <ShieldAlert size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-text-body uppercase tracking-wider mb-0.5">Reporting Issue For</p>
          <p className="text-sm font-bold text-text-heading">{assetName}</p>
        </div>
      </div>

      {createError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm border border-danger/10 flex items-center gap-2">
          <AlertCircle size={16} />
          {createError.message || 'Failed to submit report. Please try again.'}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-text-body uppercase tracking-wider">
          Issue Priority
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(ConditionSeverity).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`
                py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-tight border transition-all
                ${severity === s 
                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                  : 'bg-white border-outline-variant text-text-body hover:border-primary/50'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-[11px] font-bold text-text-body uppercase tracking-wider">
          Problem Description
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => createError && clearError()}
          placeholder="Please describe the issue in detail (e.g., battery life, screen flickering, physical damage)..."
          className="w-full min-h-[120px] p-4 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none placeholder:text-text-body/40"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={creating || description.length < 10}
          icon={Send}
          className="px-8 shadow-lg shadow-primary/20"
        >
          {creating ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};

export default ConditionReportForm;
