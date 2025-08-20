import React from 'react';
import { Outlet } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';

const Layout = () => {

  const { logout } = useAuth();

  const handleLogout = async () => {
  try {
    await logout();
    // Redirect happens automatically via RequireAuth
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

  return (
    <div className="app-layout">
      <header>
        {/* Top navigation will go here */}
        <h1>CRM</h1>    
        <button onClick={handleLogout}>Logout</button>
      </header>
      <aside>
        {/* Sidebar navigation will go here */}
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Accounts</li>
            <li>Contacts</li>
          </ul>
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
