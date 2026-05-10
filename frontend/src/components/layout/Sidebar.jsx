import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus,
  Laptop,
  User as UserIcon,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAssetTrack';
import Button from '../common/Button';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'MANAGER'] },
    { icon: Package, label: 'Assets', path: '/assets', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
    { icon: AlertTriangle, label: 'Condition Reports', path: '/condition-reports', roles: ['ADMIN', 'MANAGER'] },
    { icon: History, label: 'Allocation', path: '/allocations', roles: ['ADMIN', 'MANAGER'] },
    { icon: Laptop, label: 'Spare Laptops', path: '/spare-laptops', roles: ['ADMIN', 'MANAGER'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['ADMIN'] },
    { icon: UserIcon, label: 'My Profile', path: '/profile', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const bottomItems = [
    { icon: HelpCircle, label: 'Support', path: '/support' },
    { icon: LogOut, label: 'Logout', onClick: logout },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] h-screen bg-white border-r border-outline-variant fixed left-0 top-0 flex flex-col py-8 z-50">
      {/* Brand */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Package className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none text-text-heading">AssetTrack</h1>
            <p className="text-[10px] text-text-body font-bold uppercase tracking-wider mt-1">Enterprise Asset Mgmt</p>
          </div>
        </div>
      </div>

      {/* Action */}
      {user?.role === 'ADMIN' && (
        <div className="px-4 mb-8">
          <Link to="/assets/register" className="block w-full">
            <Button variant="primary" className="w-full !justify-start px-4 py-3">
              <Plus size={20} /> Add New Asset
            </Button>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-6 py-3.5 
              text-sm font-semibold transition-all duration-200
              border-l-4
              ${isActive 
                ? 'text-primary bg-primary-light border-primary' 
                : 'text-text-body border-transparent hover:bg-slate-50 hover:text-text-heading'}
            `}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-outline-variant pt-5">
        {bottomItems.map((item, index) => (
          item.onClick ? (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-text-body hover:bg-red-50 hover:text-danger transition-colors"
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3.5 
                text-sm font-semibold transition-colors
                ${isActive ? 'text-primary bg-primary-light' : 'text-text-body hover:bg-slate-50'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          )
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

