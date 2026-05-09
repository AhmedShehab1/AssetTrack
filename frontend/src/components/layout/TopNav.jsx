import React from 'react';
import { useAuth } from '../../hooks/useAssetTrack';
import NotificationBell from './NotificationBell';

const TopNav = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/[\s.@]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-[var(--header-height)] bg-white border-b border-outline-variant px-8 flex items-center justify-end sticky top-0 z-40 gap-8 font-sans">
      {/* Search removed - redundant */}

      {/* Actions */}
      <div className="flex items-center gap-5">
        <NotificationBell />
        
        <div className="flex items-center gap-2 border-l border-outline-variant pl-5">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-text-heading leading-none">{user?.fullName || 'User'}</span>
            <span className="text-[10px] text-text-body font-bold uppercase tracking-tighter mt-1">{user?.role?.replace('ROLE_', '') || 'Member'}</span>
          </div>
          <div 
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform"
            title={user?.fullName || user?.email}
          >
            {getInitials(user?.fullName || user?.email)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
