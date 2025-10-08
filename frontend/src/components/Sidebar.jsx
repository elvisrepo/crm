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
          <li>
            <NavLink to="/leads" className={({ isActive }) => isActive ? styles.active : ''}>
              Leads
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={({ isActive }) => isActive ? styles.active : ''}>
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/contracts" className={({ isActive }) => isActive ? styles.active : ''}>
              Contracts
            </NavLink>
          </li>
          <li>
            <NavLink to="/invoices" className={({ isActive }) => isActive ? styles.active : ''}>
              Invoices
            </NavLink>
          </li>
          <li>
            <NavLink to="/payments" className={({ isActive }) => isActive ? styles.active : ''}>
              Payments
            </NavLink>
          </li>
          <li>
            <NavLink to="/activities/tasks" className={({ isActive }) => isActive ? styles.active : ''}>
              To-Do List
            </NavLink>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;