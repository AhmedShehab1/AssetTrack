import React from 'react';
import Card from './Card';
import Badge from './Badge';

const MetricCard = ({ title, value, badgeText, badgeVariant, icon: Icon, iconBg, valueColor }) => {
  return (
    <Card padding="p-6" className="cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-5">
        <div 
          className="p-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg || 'var(--primary-light)' }}
        >
          {Icon && <Icon size={24} style={{ color: valueColor || 'var(--primary)' }} />}
        </div>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>
      <div>
        <p className="text-text-body text-[13px] font-medium mb-2 uppercase tracking-wide">{title}</p>
        <h2 className="text-3xl font-extrabold text-text-heading" style={{ color: valueColor }}>{value}</h2>
      </div>
    </Card>
  );
};

export default MetricCard;
