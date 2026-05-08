import React from 'react';
import Card from './Card';
import Badge from './Badge';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  badgeText, 
  badgeVariant = 'default',
  iconBg = 'bg-gray-50',
  valueColor = 'text-gray-900'
}) => {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        {badgeText && (
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-3xl font-bold ${valueColor}`}>{value}</h3>
      </div>
    </Card>
  );
};

export default MetricCard;
