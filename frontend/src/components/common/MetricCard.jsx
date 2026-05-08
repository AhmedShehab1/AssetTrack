import React from 'react';
import Card from './Card';
import Badge from './Badge';

const MetricCard = ({ title, value, badgeText, badgeVariant, icon: Icon, iconBg, valueColor }) => {
  return (
    <Card padding="24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ 
          backgroundColor: iconBg || 'var(--primary-light)', 
          padding: '12px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={24} style={{ color: valueColor || 'var(--primary)' }} />}
        </div>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: valueColor || 'var(--text-primary)' }}>{value}</h2>
      </div>
    </Card>
  );
};

export default MetricCard;
