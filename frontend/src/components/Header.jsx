import React from 'react';
import { useAuth } from '../auth/useAuth';
import styles from './Header.module.css';

const Header = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1>CRM</h1>
      </div>
      <div className={styles.headerCenter}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.headerRight}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;