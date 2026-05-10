import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Laptop, Eye, ShieldAlert } from 'lucide-react';

const RecentAssets = ({ assets, onViewDetails, onReportIssue }) => (
  <Card padding="p-0" className="overflow-hidden">
    <h3 className="text-lg font-bold p-6 pb-2 text-text-heading">Recent Assets</h3>
    <div className="flex flex-col">
      {assets.map(asset => (
        <div key={asset.id} className="flex items-center justify-between p-6 border-b border-outline-variant hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onViewDetails(asset)}>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-lg border border-outline-variant">
              <Laptop size={20} className="text-primary" />
            </div>
            <div>
              <div className="font-bold text-[15px] text-text-heading">{asset.brand} {asset.model}</div>
              <div className="text-xs text-text-body">SN: {asset.serialNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onReportIssue(asset); }} icon={ShieldAlert} className="text-warning hover:bg-warning/10">Condition Report</Button>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default RecentAssets;
