import React from 'react';
import { 
  Package, 
  Laptop, 
  AlertCircle, 
  RefreshCcw, 
  CheckCircle2,
  Zap,
  Monitor
} from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import StatusChart from '../components/ui/StatusChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DashboardPage = () => {
  const stats = [
    {
      title: "Total Assets",
      value: "1,240",
      badgeText: "ALL",
      icon: <Package className="text-indigo-600" size={24} />,
      iconBg: "bg-indigo-50",
    },
    {
      title: "Allocated Assets",
      value: "980",
      badgeText: "ASSIGNED",
      badgeVariant: "info",
      icon: <RefreshCcw className="text-sky-600" size={24} />,
      iconBg: "bg-sky-50",
    },
    {
      title: "Laptops Available",
      value: "210",
      badgeText: "READY",
      badgeVariant: "success",
      icon: <CheckCircle2 className="text-emerald-600" size={24} />,
      iconBg: "bg-emerald-50",
    },
    {
      title: "Pending Issues",
      value: "50",
      badgeText: "< 30 DAYS",
      badgeVariant: "danger",
      icon: <AlertCircle className="text-rose-600" size={24} />,
      iconBg: "bg-rose-50",
      valueColor: "text-rose-600",
    },
  ];

  const distributionData = [
    { label: 'Assigned', value: 980, percentage: '79%', color: 'bg-teal-500' },
    { label: 'Available', value: 210, percentage: '17%', color: 'bg-emerald-500' },
    { label: 'In Repair', value: 35, percentage: '3%', color: 'bg-amber-500' },
    { label: 'Retired', value: 15, percentage: '1%', color: 'bg-gray-400' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Real-time inventory metrics and system status.</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
          <RefreshCcw size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <MetricCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <Card className="lg:col-span-2 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Asset Status Distribution</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 px-4">
            <StatusChart dataValues={[980, 210, 35, 15]} total="1.2k" />
            
            <div className="flex-1 w-full max-w-sm space-y-4">
              {distributionData.map((item) => (
                <div key={item.label} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${item.color} shadow-sm transition-transform group-hover:scale-125`}></span>
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-400 w-8 text-right">{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-indigo-600" size={20} fill="currentColor" />
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          </div>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Instantly locate hardware for new hires or immediate replacements.
          </p>
          
          <div className="space-y-4 mt-auto">
            <Button variant="primary" className="w-full">
              <Monitor size={18} />
              <span>Find Available Spare Laptop</span>
            </Button>
            <Button variant="secondary" className="w-full">
              <Package size={18} />
              <span>Log New Delivery</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
