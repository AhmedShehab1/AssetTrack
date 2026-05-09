import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw, 
  Zap, 
  Laptop, 
  FileText,
  Eye
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusChart from '../components/common/StatusChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import AllocationModalContent from '../components/common/AllocationModalContent';
import { dashboardService, assetService } from '../api/services';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState({
    summary: null,
    recentAssets: []
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, assetsData] = await Promise.all([
          dashboardService.inventory(),
          assetService.list({ size: 5 })
        ]);
        setData({
          summary: summaryData,
          recentAssets: assetsData.content || []
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <RefreshCcw className="animate-spin inline-block mr-2" size={20} />
      Loading Dashboard...
    </div>
  );

  const { summary, recentAssets } = data;
  
  // Prepare status distribution data for chart
  // Assuming statusDistribution labels match ['Available', 'Allocated'] or similar
  const statusData = summary?.statusDistribution?.data || [0, 0];
  const statusLabels = summary?.statusDistribution?.labels || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      {error && <GlobalErrorAlert message={error} onClose={() => setError(null)} />}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '800' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time inventory metrics and system status.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <RefreshCcw size={14} /> Last updated: Just now
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <MetricCard 
          title="Total Assets" 
          value={summary?.totalAssets || 0} 
          badgeText="ALL" 
          icon={Package} 
          iconBg="var(--primary-light)"
          valueColor="var(--primary)"
        />
        <MetricCard 
          title="Laptops Ready" 
          value={summary?.statusDistribution?.data[0] || 0} 
          badgeText="READY" 
          badgeVariant="success"
          icon={CheckCircle2} 
          iconBg="var(--success-bg)"
          valueColor="var(--success)"
        />
        <MetricCard 
          title="In Maintenance" 
          value={summary?.statusDistribution?.data[2] || 0} 
          badgeText="URGENT" 
          badgeVariant="danger"
          icon={AlertTriangle} 
          iconBg="var(--danger-bg)"
          valueColor="var(--danger)"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px' 
      }}>
        {/* Asset Inventory List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Chart Section */}
          <Card>
            <h3 style={{ fontSize: '18px', marginBottom: '32px', fontWeight: '700' }}>Asset Status Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '40px' }}>
              <StatusChart data={statusData} total={summary?.totalAssets || 0} />
              
              <div style={{ flex: 1, maxWidth: '300px' }}>
                {statusLabels.map((label, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: idx === 0 ? '#22c55e' : (idx === 1 ? '#3F51B5' : '#f59e0b') 
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>{statusData[idx]}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', width: '35px', textAlign: 'right' }}>
                        {Math.round((statusData[idx] / (summary?.totalAssets || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Inventory Section */}
          <Card>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700' }}>Recent Assets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentAssets.map(asset => (
                <div key={asset.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-page)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <Laptop size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{asset.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SN: {asset.serialNumber}</div>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => {
                    setSelectedAsset(asset);
                    setIsModalOpen(true);
                  }}>
                    <Eye size={16} /> View Details
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Zap size={20} color="var(--primary)" fill="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Quick Actions</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px' }}>
              Instantly locate hardware for new hires or immediate replacements.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Button variant="primary" icon={Laptop} style={{ width: '100%', justifyContent: 'flex-start' }}>
                Find Available Spare Laptop
              </Button>
              <Button variant="secondary" icon={FileText} style={{ width: '100%', justifyContent: 'flex-start' }}>
                Log New Delivery
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Allocation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedAsset?.name}
        subtitle={`SN: ${selectedAsset?.serialNumber}`}
      >
        <AllocationModalContent 
          assetName={selectedAsset?.name}
          assetSN={selectedAsset?.serialNumber}
          onComplete={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;
