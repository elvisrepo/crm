import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/client';
import styles from './AccountsPage.module.css';

export default function AccountsPage() {
    
    const [searchTerm, setSearchTerm] = useState('');

     // This one line replaces all your useState and useEffect for data fetching!
    const { data: accounts = [], isLoading, isError, error } = useQuery({
        queryKey: ['accounts'], // A unique key for this data
        queryFn: getAccounts,  // The function that fetches the data
    });

 

    const filteredAccounts = accounts.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading accounts...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Accounts</h1>
                <Link to="/accounts/new" className={styles.newButton}>
                    New Account
                </Link>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Type</th>
                            <th>Phone</th>
                            <th>Website</th>
                            <th>Owner</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.noData}>
                                    No accounts found
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map((account) => (
                                <tr key={account.id}>
                                    <td>
                                        <Link
                                            to={`/accounts/${account.id}`}
                                            className={styles.accountLink}
                                        >
                                            {account.name}
                                        </Link>
                                    </td>
                                    <td className={styles.type}>
                                        {account.type}
                                    </td>
                                    <td>{account.phone || '-'}</td>
                                    <td>
                                        {account.website ? (
                                            <a
                                                href={account.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.websiteLink}
                                            >
                                                {account.website}
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td>{account.owner}</td>
                                    <td>
                                        <Link
                                            to={`/accounts/${account.id}/edit`}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredAccounts.length} of {accounts.length} accounts
            </div>
        </div>
    );
}