import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Package, CheckCircle2, AlertTriangle, Zap, Laptop, Eye, Truck, ShieldAlert } from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusChart from '../components/common/StatusChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import AllocationModalContent from '../components/common/AllocationModalContent';
import ActionModal from '../components/common/ActionModal';
import { dashboardService, assetService } from '../api/services';
import { useAuth } from '../hooks/useAssetTrack';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const DashboardPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState({ summary: null, recentAssets: [] });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, assetsData] = await Promise.all([
          dashboardService.inventory(),
          assetService.list({ size: 5 })
        ]);
        setData({ summary: summaryData, recentAssets: assetsData.content || [] });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-20 text-center text-text-body">
      <RefreshCcw className="animate-spin inline-block mr-2" size={20} />
      Loading Dashboard...
    </div>
  );

  const { summary, recentAssets } = data;
  
  const statusLabels = summary?.byStatus?.map(s => s.status) || [];
  const statusData = summary?.byStatus?.map(s => s.count) || [];
  const getStatusCount = (status) => summary?.byStatus?.find(s => s.status === status)?.count || 0;

  return (
    <div className="max-w-[1200px] mx-auto py-5">
      {error && <GlobalErrorAlert error={error} onClose={() => setError(null)} />}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-text-heading">Dashboard Overview</h1>
          <p className="text-text-body text-sm">Real-time inventory metrics and system status.</p>
        </div>
        <div className="flex items-center gap-2 text-text-body text-[13px]">
          <RefreshCcw size={14} /> Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Assets" value={summary?.totalAssets || 0} badgeText="ALL" icon={Package} iconBg="var(--primary-light)" valueColor="var(--primary)" />
        <MetricCard title="Laptops Available" value={getStatusCount('AVAILABLE')} badgeText="READY" badgeVariant="success" icon={CheckCircle2} iconBg="var(--success-bg)" valueColor="var(--success)" />
        <MetricCard title="Pending Issues" value={summary?.openConditionReports || 0} badgeText="TOTAL" badgeVariant="danger" icon={AlertTriangle} iconBg="var(--danger-bg)" valueColor="var(--danger)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-8 text-text-heading">Asset Status Distribution</h3>
            <div className="flex items-center justify-around gap-10">
              <StatusChart data={statusData} total={summary?.totalAssets || 0} labels={statusLabels} />
              <div className="flex-1 max-w-[300px]">
                {statusLabels.map((label, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label === 'AVAILABLE' ? '#22c55e' : (label === 'ALLOCATED' || label === 'ASSIGNED' ? '#3F51B5' : (label === 'SPARE' ? '#6366f1' : '#f59e0b')) }}></div>
                      <span className="text-sm font-medium text-text-body">{label === 'ASSIGNED' ? 'Allocated' : label.charAt(0) + label.slice(1).toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex gap-5">
                      <span className="text-sm font-bold text-text-heading">{statusData[idx]}</span>
                      <span className="text-sm text-text-body w-[35px] text-right">{Math.round((statusData[idx] / (summary?.totalAssets || 1)) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-5 text-text-heading">Recent Assets</h3>
            <div className="flex flex-col gap-3">
              {recentAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg border border-outline-variant"><Laptop size={20} className="text-primary" /></div>
                    <div>
                      <div className="font-bold text-[15px] text-text-heading">{asset.brand} {asset.model}</div>
                      <div className="text-xs text-text-body">SN: {asset.serialNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }} icon={Eye}>View Details</Button>
                    <Button variant="ghost" onClick={() => { setSelectedAsset(asset); setIsReportModalOpen(true); }} icon={ShieldAlert} className="text-warning hover:bg-warning/10">Condition Report</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center gap-2.5 mb-3">
              <Zap size={20} className="text-primary fill-primary" />
              <h3 className="text-lg font-bold text-text-heading">Quick Actions</h3>
            </div>
            <p className="text-text-body text-sm leading-relaxed mb-8">Instantly locate hardware for new hires or immediate replacements.</p>
            <div className="flex flex-col gap-4">
              <Button variant="primary" icon={Laptop} className="w-full !justify-start" onClick={() => navigate('/spare-laptops')}>Find Available Spare Laptop</Button>
              {currentUser?.role === 'ADMIN' && (
                <Button variant="outline" icon={Truck} className="w-full !justify-start" onClick={() => navigate('/assets/register')}>Log New Delivery</Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`${selectedAsset?.brand} ${selectedAsset?.model}`}
        subtitle={`SN: ${selectedAsset?.serialNumber}`}
      >
        <AllocationModalContent 
          assetId={selectedAsset?.id}
          assetName={`${selectedAsset?.brand} ${selectedAsset?.model}`}
          assetSN={selectedAsset?.serialNumber}
          onComplete={() => setIsModalOpen(false)}
        />
      </Modal>

      <ActionModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        type="REPORT_ISSUE"
        payload={selectedAsset}
      />
    </div>
  );
};

export default DashboardPage;
