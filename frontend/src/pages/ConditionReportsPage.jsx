import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { conditionReportService } from '../api/services/conditions';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const ConditionReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await conditionReportService.listAll({ size: 1000 });
        setReports(response.content || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'neutral';
    }
  };

  if (loading) return <div className="p-20 text-center">Loading reports...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 font-sans">
      <h1 className="text-3xl font-black text-text-heading">Global Condition Reports</h1>
      {error && <GlobalErrorAlert error={error} />}
      
      <div className="space-y-4">
        {reports.map((report) => (
          <Card 
            key={report.id} 
            padding="p-6" 
            className="cursor-pointer hover:shadow-lg transition-all border-outline-variant"
            onClick={() => navigate(`/assets/${report.assetId}/reports?reportId=${report.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-text-heading">{report.asset.brand} {report.asset.model}</h3>
                <Badge variant={getSeverityVariant(report.severity)} className="text-[9px]">{report.severity}</Badge>
                <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'text-success' : 'text-primary'}`}>
                  {report.status}
                </span>
              </div>
              <span className="text-[10px] font-bold text-text-body opacity-40 uppercase">
                {new Date(report.reportedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <MessageSquare size={18} className="text-slate-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-heading font-medium leading-relaxed">{report.description}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-text-body font-bold opacity-60">
                  <span>Reported by</span>
                  <span className="text-primary uppercase">{report.reportedBy?.fullName || 'Member'}</span>
                </div>
              </div>
            </div>

            {report.resolutionNotes && (
              <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100/50 flex gap-3">
                <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black text-success uppercase tracking-widest mb-1">Resolution</p>
                  <p className="text-xs text-green-900 font-medium leading-relaxed opacity-80 m-0">{report.resolutionNotes}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConditionReportsPage;
