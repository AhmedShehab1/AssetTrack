import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw, 
  Zap, 
  Laptop, 
  Truck 
} from 'lucide-react';
import MetricCard from './components/common/MetricCard';
import StatusChart from './components/common/StatusChart';
import Card from './components/common/Card';
import Button from './components/common/Button';

const DashboardOverview = () => {
  const statusData = [210, 1030]; // Available, Allocated

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard Overview</h1>
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
          value="1,240" 
          badgeText="ALL" 
          icon={Package} 
          iconBg="var(--primary-light)"
          valueColor="var(--primary)"
        />
        <MetricCard 
          title="Laptops Available" 
          value="210" 
          badgeText="READY" 
          badgeVariant="success"
          icon={CheckCircle2} 
          iconBg="var(--success-bg)"
          valueColor="var(--success)"
        />
        <MetricCard 
          title="Pending Issues" 
          value="50" 
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
        {/* Status Distribution */}
        <Card>
          <h3 style={{ fontSize: '18px', marginBottom: '32px' }}>Asset Status Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '40px' }}>
            <StatusChart data={statusData} total="1.2k" />
            
            <div style={{ flex: 1, maxWidth: '300px' }}>
              {[
                { label: 'Available', value: 210, percent: '17%', color: '#22c55e' },
                { label: 'Allocated', value: 1030, percent: '83%', color: '#3F51B5' },
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.value}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', width: '35px', textAlign: 'right' }}>{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px' }}>Quick Actions</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px' }}>
            Instantly locate hardware for new hires or immediate replacements.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Button variant="primary" icon={Laptop} style={{ width: '100%', justifyContent: 'flex-start' }}>
              Find Available Spare Laptop
            </Button>
            <Button variant="outline" icon={Truck} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary)' }}>
              Log New Delivery
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
