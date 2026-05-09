import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <main style={{ padding: '30px', flex: 1 }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
