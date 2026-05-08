import React from 'react';
import { LayoutDashboard, Package, History, Users, Settings, HelpCircle, LogOut, Plus } from 'lucide-react';
import Button from '../common/Button';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Assets' },
    { icon: History, label: 'Allocation' },
    { icon: Users, label: 'Users' },
    { icon: Settings, label: 'Settings' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'Support' },
    { icon: LogOut, label: 'Logout' },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-color)',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '30px 0',
      zIndex: 100
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package color="white" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>AssetTrack</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Enterprise Asset Mgmt</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginBottom: '30px' }}>
        <Button variant="primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}>
          <Plus size={20} /> Add New Asset
        </Button>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: item.active ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: item.active ? 'var(--primary-light)' : 'transparent',
            borderLeft: item.active ? '4px solid var(--primary)' : '4px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: item.active ? '700' : '500'
          }}>
            <item.icon size={20} />
            {item.label}
          </div>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        {bottomItems.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <item.icon size={20} />
            {item.label}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;