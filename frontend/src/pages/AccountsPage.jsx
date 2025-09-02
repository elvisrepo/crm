import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createAccount } from '../api/client';
import styles from './AccountsPage.module.css';
import Modal from '../components/Modal';
import NewAccountForm from '../components/NewAccountForm';

export default function AccountsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading, isError, error } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const createAccountMutation = useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            queryClient.invalidateQueries(['accounts']);
            setIsModalOpen(false);
        },
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
                <div className={styles.error}>{error.message}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Accounts</h1>
                <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>
                    New Account
                </button>
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
                        {filteredAccounts.map((account) => (
                            <tr key={account.id}>
                                <td>
                                    <Link to={`/accounts/${account.id}`} className={styles.accountLink}>
                                        {account.name}
                                    </Link>
                                </td>
                                <td className={styles.type}>{account.type}</td>
                                <td>{account.phone || '-'}</td>
                                <td>
                                    {account.website ? (
                                        <a href={account.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                                            {account.website}
                                        </a>
                                    ) : '-'}
                                </td>
                                <td>{account.owner}</td>
                                <td>
                                    <Link to={`/accounts/${account.id}/edit`} className={styles.editButton}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredAccounts.length} of {accounts.length} accounts
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <NewAccountForm
                    onSubmit={createAccountMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createAccountMutation.isLoading}
                    error={createAccountMutation.error}
                    accounts={accounts}
                />
            </Modal>
        </div>
    );
}
