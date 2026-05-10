import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../common/MetricCard';
import { Package, CheckCircle2, AlertTriangle } from 'lucide-react';

const DashboardMetrics = ({ summary }) => {
  const navigate = useNavigate();
  const getStatusCount = (status) => summary?.byStatus?.find(s => s.status === status)?.count || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div onClick={() => navigate('/assets')} className="cursor-pointer">
        <MetricCard title="Total Assets" value={summary?.totalAssets || 0} badgeText="ALL" icon={Package} iconBg="var(--primary-light)" valueColor="var(--primary)" />
      </div>
      <div onClick={() => navigate('/spare-laptops?type=LAPTOP')} className="cursor-pointer">
        <MetricCard title="Laptops Available" value={getStatusCount('AVAILABLE')} badgeText="READY" badgeVariant="success" icon={CheckCircle2} iconBg="var(--success-bg)" valueColor="var(--success)" />
      </div>
      <div onClick={() => navigate('/condition-reports')} className="cursor-pointer">
        <MetricCard title="Pending Issues" value={summary?.openConditionReports || 0} badgeText="TOTAL" badgeVariant="danger" icon={AlertTriangle} iconBg="var(--danger-bg)" valueColor="var(--danger)" />
      </div>
    </div>
  );
};

export default DashboardMetrics;
