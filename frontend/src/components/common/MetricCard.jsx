import React from 'react';
import Card from './Card';
import Badge from './Badge';

const MetricCard = ({ title, value, badgeText, badgeVariant, icon: Icon, iconBg, valueColor, onClick }) => {
  return (
    <Card 
      padding="p-6" 
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-5">
        <div 
          className="p-3 rounded-xl flex items-center justify-center shadow-inner"
          style={{ backgroundColor: iconBg || 'var(--primary-light)' }}
        >
          {Icon && <Icon size={24} style={{ color: valueColor || 'var(--primary)' }} />}
        </div>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>
      <div>
        <p className="text-text-body text-[13px] font-bold mb-2 uppercase tracking-[0.1em] opacity-70">{title}</p>
        <h2 className="text-4xl font-black text-text-heading leading-none" style={{ color: valueColor }}>{value}</h2>
      </div>
    </Card>
  );
};


export default MetricCard;
