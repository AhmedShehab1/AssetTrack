import React from 'react';
import Card from '../common/Card';
import StatusChart from '../common/StatusChart';

const StatusDistribution = ({ statusData, totalAssets, statusLabels }) => (
  <Card>
    <h3 className="text-lg font-bold mb-8 text-text-heading">Asset Status Distribution</h3>
    <div className="flex items-center justify-around gap-10">
      <StatusChart data={statusData} total={totalAssets || 0} labels={statusLabels} />
      <div className="flex-1 max-w-[300px]">
        {statusLabels.map((label, idx) => (
          <div key={idx} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label === 'AVAILABLE' ? '#22c55e' : (label === 'ALLOCATED' || label === 'ASSIGNED' ? '#3F51B5' : (label === 'SPARE' ? '#6366f1' : '#f59e0b')) }}></div>
              <span className="text-sm font-medium text-text-body">{label === 'ASSIGNED' ? 'Allocated' : label.charAt(0) + label.slice(1).toLowerCase().replace('_', ' ')}</span>
            </div>
            <div className="flex gap-5">
              <span className="text-sm font-bold text-text-heading">{statusData[idx]}</span>
              <span className="text-sm text-text-body w-[35px] text-right">{Math.round((statusData[idx] / (totalAssets || 1)) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

export default StatusDistribution;
