import React from 'react';
import { RotateCcw, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';

const ReportActions = ({ report, onUpdateStatus, onOpenResolveModal }) => {
  const buttonClass = "!text-[10px] !py-1.5 font-black uppercase tracking-widest";

  return (
    <div className="bg-slate-50/50 border-t border-outline-variant p-3 flex justify-end gap-2">
      {report.status !== 'OPEN' && (
        <Button
          variant="ghost"
          className={`${buttonClass} text-amber-600`}
          onClick={() => onUpdateStatus(report.id, 'OPEN')}
          icon={RotateCcw}
        >
          Re-open
        </Button>
      )}
      {report.status === 'OPEN' && (
        <Button
          variant="ghost"
          className={`${buttonClass} text-info`}
          onClick={() => onUpdateStatus(report.id, 'IN_PROGRESS')}
          icon={PlayCircle}
        >
          In Progress
        </Button>
      )}
      {(report.status === 'OPEN' || report.status === 'IN_PROGRESS') && (
        <Button
          variant="ghost"
          className={`${buttonClass} text-success`}
          onClick={() => onOpenResolveModal(report)}
          icon={CheckCircle}
        >
          Mark Resolved
        </Button>
      )}
      {report.status === 'RESOLVED' && (
        <Button
          variant="ghost"
          className={`${buttonClass} text-danger`}
          onClick={() => onUpdateStatus(report.id, 'CLOSED')}
          icon={XCircle}
        >
          Close Case
        </Button>
      )}
    </div>
  );
};

export default ReportActions;
