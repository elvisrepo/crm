import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="app-layout">
      <header>
        {/* Top navigation will go here */}
        <h1>CRM</h1>
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
