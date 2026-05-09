import React from 'react';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '400px', backgroundColor: 'var(--bg-page)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search assets, users, or locations..." 
          style={{ border: 'none', background: 'none', marginLeft: '10px', width: '100%', outline: 'none', fontSize: '14px' }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></div>
        </div>
        <HelpCircle size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
        <Settings size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', cursor: 'pointer' }} title={user?.fullName || user?.email}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
            {getInitials(user?.fullName || user?.email)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;