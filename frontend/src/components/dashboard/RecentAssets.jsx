import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Laptop, Eye, ShieldAlert } from 'lucide-react';

const RecentAssets = ({ assets, onViewDetails, onReportIssue }) => (
  <Card>
    <h3 className="text-lg font-bold mb-5 text-text-heading">Recent Assets</h3>
    <div className="flex flex-col gap-3">
      {assets.map(asset => (
        <div key={asset.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface">
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
            <Button variant="outline" onClick={() => onViewDetails(asset)} icon={Eye}>View Details</Button>
            <Button variant="ghost" onClick={() => onReportIssue(asset)} icon={ShieldAlert} className="text-warning hover:bg-warning/10">Condition Report</Button>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default RecentAssets;
