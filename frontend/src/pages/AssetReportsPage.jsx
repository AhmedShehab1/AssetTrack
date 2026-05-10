import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, ChevronLeft, Clock, MessageSquare, CheckCircle2, Plus } from 'lucide-react';
import { assetService } from '../api/services/assets';
import { conditionReportService } from '../api/services/conditions';
import { useAuth } from '../hooks/useAssetTrack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ActionModal from '../components/common/ActionModal';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';
import ReportActions from '../components/assets/ReportActions';

const AssetReportsPage = () => {
  const { assetId } = useParams();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [asset, setAsset] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, payload: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetData, reportsData] = await Promise.all([
        assetService.getById(assetId),
        conditionReportService.list(assetId, { size: 1000 })
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

  const handleStatusUpdate = async (reportId, status, resolutionNotes = '') => {
    try {
      if (status === 'RESOLVED') {
        await conditionReportService.resolve(assetId, reportId);
      } else {
        await conditionReportService.update(assetId, reportId, { status, resolutionNotes });
      }
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

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-10"><GlobalErrorAlert error={error} /></div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{asset?.brand} {asset.model} - Condition History</h1>
        <Button onClick={() => setModalConfig({ isOpen: true, type: 'REPORT_ISSUE', payload: asset })} icon={Plus}>
          New Report
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} padding="p-0" className={report.id === reportId ? 'ring-2 ring-primary' : ''}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge>
                <span>{report.status}</span>
              </div>
              <p>{report.description}</p>
              {report.resolutionNotes && <p className="mt-4 text-green-700">Resolution: {report.resolutionNotes}</p>}
            </div>
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
              <ReportActions 
                report={report}
                onUpdateStatus={handleStatusUpdate}
                onOpenResolveModal={(r) => setModalConfig({ isOpen: true, type: 'RESOLVE_REPORT', payload: r })}
              />
            )}
          </Card>
        ))}
      </div>

      <ActionModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null, payload: null })}
        type={modalConfig.type}
        payload={modalConfig.payload}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default AssetReportsPage;
