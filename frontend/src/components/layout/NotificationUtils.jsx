import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, Bell } from 'lucide-react';

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'WARRANTY_EXPIRY': return <AlertTriangle size={16} className="text-warning" />;
    case 'LOW_STOCK': return <AlertCircle size={16} className="text-danger" />;
    case 'ASSET_ALLOCATED': return <CheckCircle2 size={16} className="text-success" />;
    case 'ASSET_RETURNED': return <Info size={16} className="text-info" />;
    case 'CONDITION_REPORT_OPENED': return <AlertTriangle size={16} className="text-warning" />;
    case 'CONDITION_REPORT_RESOLVED': return <CheckCircle2 size={16} className="text-success" />;
    default: return <Bell size={16} className="text-text-body" />;
  }
};

export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
