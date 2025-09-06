// src/pages/DashboardPage.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccounts, getContacts, getOpportunities } from '../api/client';
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

const ContactsSummary = () => {
    const { data: contacts = [], isLoading, isError } = useQuery({
        queryKey: ['contacts'],
        queryFn: getContacts
    });

    if (isLoading) return <div className={styles.loading}>Loading contact summary...</div>;
    if (isError) return <div className={styles.error}>Could not load contact summary.</div>;

    const recentContacts = contacts.slice(0, 5);

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Recent Contacts</h2>
            <div className={styles.cardContent}>
                {recentContacts.length > 0 ? (
                    <ul>
                        {recentContacts.map(contact => (
                            <li key={contact.id}>
                                <Link to={`/contacts/${contact.id}`}>
                                    {contact.first_name} {contact.last_name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No contacts found.</p>
                )}
            </div>
            <div className={styles.cardFooter}>
                <Link to="/contacts">View All ({contacts.length})</Link>
            </div>
        </div>
    );
};


const OpportunitiesSummary = () => {

    const { data: opportunities = [], isLoading, isError} = useQuery({
        queryKey: ['opportunities'],
        queryFn : getOpportunities,
    })

    if (isLoading) return <div className={styles.loading}>Loading Opportunity summary...</div>;
    if (isError) return <div className={styles.error}>Could not load Opportunity summary.</div>;

    const recentOpportunities = opportunities.slice(0,5)

    return (
        <div className={styles.card}>
             <h2 className={styles.cardHeader}>Recent Opportunities</h2>
             <div className={styles.cardContent}>
                {recentOpportunities.length > 0 ?  (
                    <ul>
                        {recentOpportunities.map(opp => (
                            <li key={opp.id}>
                                <Link to={`/opportunities/${opp.id}`}>
                                    {opp?.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p> No opportunities found.</p>
                )
                
                }
            </div>
            <div className={styles.cardFooter}>
                <Link to="/opportunities">View All ({opportunities.length})</Link>
            </div>
        </div>
    )

}


const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
      </header>
      <div className={styles.grid}>
        <AccountsSummary />
        <ContactsSummary />
        <OpportunitiesSummary />
        {/* You can add more summary cards here for Contacts, Opportunities, etc. */}
        {/* Example: <ContactsSummary /> */}
      </div>
    </div>
  );
};

export default DashboardPage;