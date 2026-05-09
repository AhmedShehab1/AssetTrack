import React from 'react';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const TopNav = () => {
  const user = useAuthStore((state) => state.user);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/[\s.@]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-[var(--header-height)] bg-white border-b border-outline-variant px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center w-full max-w-md bg-bg-page px-4 py-2 rounded-xl border border-outline-variant focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
        <Search size={18} className="text-text-body" />
        <input 
          type="text" 
          placeholder="Search assets, users, or locations..." 
          className="bg-transparent border-none ml-3 w-full outline-none text-sm text-text-heading placeholder:text-text-body/60"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <div className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell size={20} className="text-text-body" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex items-center gap-2 border-l border-outline-variant pl-5">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-text-heading leading-none">{user?.fullName || 'User'}</span>
            <span className="text-[10px] text-text-body font-bold uppercase tracking-tighter mt-1">{user?.role || 'Member'}</span>
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
