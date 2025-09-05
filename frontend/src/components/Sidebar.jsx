import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/accounts" className={({ isActive }) => isActive ? styles.active : ''}>
              Accounts
            </NavLink>
          </li>
          <li>
            <NavLink to="/contacts" className={({ isActive }) => isActive ? styles.active : ''}>
              Contacts
            </NavLink>
          </li>
          <li>
            <NavLink to="/opportunities" className={({ isActive }) => isActive ? styles.active : ''}>
              Opportunities
            </NavLink>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;