import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Send,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { assetService } from '../api/services/assets';
import { conditionService } from '../api/services/conditions';
import { useAuth } from '../hooks/useAssetTrack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/common/StatusBadge';
import ActionModal from '../components/common/ActionModal';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const AssetReportsPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [asset, setAsset] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for adding/updating reports
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, payload: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetData, reportsData] = await Promise.all([
        assetService.getById(assetId),
        conditionService.list(assetId, { size: 50 })
      ]);
      setAsset(assetData);
      setReports(reportsData.content || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (reportId, status, resolutionNotes) => {
    try {
      await conditionService.update(assetId, reportId, { status, resolutionNotes });
      fetchData();
    } catch (err) {
      console.error("Failed to update report", err);
    }
  };

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'neutral';
    }
  };

  if (loading) return (
    <div className="p-20 text-center text-text-body font-sans uppercase tracking-[0.2em] opacity-40 animate-pulse">
      Loading History...
    </div>
  );

  if (error) return (
    <div className="container mx-auto py-10 px-4">
      <GlobalErrorAlert error={error} />
      <Button variant="outline" onClick={() => navigate('/assets')} icon={ChevronLeft} className="mt-4">
        Back to Inventory
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 font-sans max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/assets')}
            className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={14} /> Back to Inventory
          </button>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-black text-text-heading tracking-tight m-0">{asset.brand} {asset.model}</h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-text-body font-mono text-sm font-bold opacity-60">SERIAL: {asset.serialNumber}</p>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          className="shadow-xl px-8"
          onClick={() => setModalConfig({ isOpen: true, type: 'REPORT_ISSUE', payload: asset })}
        >
          Submit New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Asset Summary */}
        <div className="space-y-6">
          <Card padding="p-6" className="bg-slate-50 border-outline-variant shadow-inner">
            <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] mb-6 opacity-40">Hardware Summary</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-text-body uppercase opacity-60">Type</span>
                <span className="text-sm font-black text-text-heading">{asset.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-text-body uppercase opacity-60">Purchased</span>
                <span className="text-sm font-black text-text-heading">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-text-body uppercase opacity-60">Warranty</span>
                <span className={`text-sm font-black ${asset.warrantyExpired ? 'text-danger' : 'text-text-heading'}`}>
                  {new Date(asset.warrantyExpirationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <span className="text-[11px] font-bold text-text-body uppercase opacity-60 block mb-2">Custodian</span>
                {asset.currentOwner ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-primary text-[8px] font-black border border-primary/10">
                      {asset.currentOwner.fullName?.[0]}
                    </div>
                    <span className="text-sm font-bold text-text-heading">{asset.currentOwner.fullName}</span>
                  </div>
                ) : <span className="text-sm font-bold text-gray-400 italic">Unallocated</span>}
              </div>
            </div>
          </Card>

          <Card padding="p-6" className="bg-primary shadow-2xl shadow-primary/20 border-none text-white overflow-hidden relative">
             <ShieldAlert className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-10 rotate-12" />
             <div className="relative z-10">
                <h4 className="text-lg font-black mb-2">Condition Tracking</h4>
                <p className="text-white/70 text-xs leading-relaxed font-medium">
                  Maintaining accurate logs ensures timely repairs and reliable hardware for the whole team.
                </p>
             </div>
          </Card>
        </div>

        {/* Right Column: Reports Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] flex items-center gap-2 opacity-40">
            <Clock size={14} /> Historical Condition Logs
          </h3>

          {reports.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-outline-variant font-sans">
              <p className="text-sm text-text-body font-bold opacity-40 uppercase tracking-widest">No issues reported for this unit.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} padding="p-0" className="overflow-hidden hover:shadow-lg transition-all group border-outline-variant">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityVariant(report.severity)} className="text-[9px] px-2 py-0.5">
                          {report.severity}
                        </Badge>
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
                        <p className="text-sm text-text-heading font-medium leading-relaxed m-0">
                          {report.description}
                        </p>
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
                          <p className="text-xs text-green-900 font-medium leading-relaxed opacity-80 m-0">
                            {report.resolutionNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resolution Actions - Admin/Manager Only */}
                  {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && report.status !== 'CLOSED' && (
                    <div className="bg-slate-50/50 border-t border-outline-variant p-4 flex justify-end gap-2 group-hover:bg-slate-50 transition-colors">
                       <Button 
                        variant="ghost" 
                        className="!text-[10px] !py-1.5 font-black uppercase tracking-widest text-text-body hover:text-primary"
                        onClick={() => {
                          const notes = window.prompt("Resolution Notes:", report.resolutionNotes || "");
                          if (notes !== null) handleResolve(report.id, 'RESOLVED', notes);
                        }}
                       >
                         {report.status === 'RESOLVED' ? 'Update Notes' : 'Mark Resolved'}
                       </Button>
                       {report.status === 'RESOLVED' && (
                         <Button 
                          variant="ghost" 
                          className="!text-[10px] !py-1.5 font-black uppercase tracking-widest text-text-body hover:text-danger"
                          onClick={() => handleResolve(report.id, 'CLOSED', report.resolutionNotes)}
                         >
                           Close Case
                         </Button>
                       )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ActionModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        payload={modalConfig.payload}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default AssetReportsPage;
