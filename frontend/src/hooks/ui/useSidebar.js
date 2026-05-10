import { useAuth } from '../../hooks/useAssetTrack';

export const useSidebar = () => {
  const { user, logout } = useAuth();
  
  const allMenuItems = [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'Package', label: 'Assets', path: '/assets', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
    { icon: 'History', label: 'Allocation', path: '/allocations', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'Laptop', label: 'Spare Laptops', path: '/spare-laptops', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'Users', label: 'Users', path: '/users', roles: ['ADMIN'] },
    { icon: 'UserIcon', label: 'My Profile', path: '/profile', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
    { icon: 'Settings', label: 'Settings', path: '/settings', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const bottomItems = [
    { icon: 'HelpCircle', label: 'Support', path: '/support' },
    { icon: 'LogOut', label: 'Logout', onClick: logout },
  ];

  return { user, menuItems, bottomItems };
};
