import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';

const NavItem = ({ item }) => {
  const Icon = Icons[item.icon];
  return (
    <NavLink
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
      <Icon size={20} />
      {item.label}
    </NavLink>
  );
};

export default NavItem;
