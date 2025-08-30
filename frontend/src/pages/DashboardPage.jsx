// src/pages/DashboardPage.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/client';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css'; // Import the CSS module

// A simple summary component for Accounts
const AccountsSummary = () => {
    const { data: accounts, isLoading, isError } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    if (isLoading) return <div className={styles.loading}>Loading account summary...</div>;
    if (isError) return <div className={styles.error}>Could not load account summary.</div>;

    const recentAccounts = accounts.slice(0, 5);

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Recent Accounts</h2>
            <div className={styles.cardContent}>
                {recentAccounts.length > 0 ? (
                    <ul>
                        {recentAccounts.map(acc => (
                            <li key={acc.id}>
                                <Link to={`/accounts/${acc.id}`}>{acc.name}</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No accounts found.</p>
                )}
            </div>
            <div className={styles.cardFooter}>
                <Link to="/accounts">View All ({accounts.length})</Link>
            </div>
        </div>
    );
}

const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
      </header>
      <div className={styles.grid}>
        <AccountsSummary />
        {/* You can add more summary cards here for Contacts, Opportunities, etc. */}
        {/* Example: <ContactsSummary /> */}
      </div>
    </div>
  );
};

export default DashboardPage;