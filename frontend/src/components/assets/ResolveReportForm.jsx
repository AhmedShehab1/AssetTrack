import React, { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import { conditionReportService } from '../../api/services/conditions';

const ResolveReportForm = ({ assetId, reportId, currentNotes, onComplete, onCancel }) => {
  const [resolutionNotes, setResolutionNotes] = useState(currentNotes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await conditionReportService.update(assetId, reportId, { 
        status: 'RESOLVED', 
        resolutionNotes: resolutionNotes.trim() 
      });
      onComplete();
    } catch (err) {
      console.error("Failed to resolve report", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="notes" className="block text-[11px] font-bold text-text-body uppercase tracking-wider">
          Resolution Notes
        </label>
        <textarea
          id="notes"
          required
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Describe how the issue was resolved..."
          className="w-full min-h-[120px] p-4 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={loading} icon={Send}>
          {loading ? 'Processing...' : 'Submit Resolution'}
        </Button>
      </div>
    </form>
  );
};

export default ResolveReportForm;
