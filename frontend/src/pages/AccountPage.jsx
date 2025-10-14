import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccount, deleteAccount } from "../api/client";
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './AccountPage.module.css';

const AccountPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();

    const { data: account, isLoading, isError, error } = useQuery({
        queryKey: ['account', id],
        queryFn: () => getAccount(id),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Invalidate the list of accounts
            navigate('/accounts'); // Redirect to the accounts list page
        },
        onError: (error) => {
            console.error("Error deleting account:", error);
            alert(`Failed to delete account: ${error.message || 'An unexpected error occurred.'}`);
        },
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete account "${account?.name}"?`)) {
            if (account?.id && account?.version) {
                deleteAccountMutation.mutate({ id: account.id, version: account.version });
            } else {
                alert("Account data is incomplete for deletion.");
            }
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading account...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{account?.name}</h1>
                <div className={styles.actions}>
                    <Link to={`/accounts/${id}/edit`} className={`${styles.editButton} ${styles.button}`}>Edit</Link>
                    <button
                        onClick={handleDelete}
                        className={`${styles.deleteButton} ${styles.button}`}
                        disabled={deleteAccountMutation.isLoading}
                    >
                        {deleteAccountMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Account Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}>
                            <label>Description</label>
                            <span className={styles.description}>{account?.description || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Phone</label>
                            <span>{account?.phone || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Website</label>
                            <span>{account?.website ? <a href={account.website} target="_blank" rel="noopener noreferrer">{account.website}</a> : '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Type</label>
                            <span>{account?.type}</span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Address Information</h2>
                        <div className={styles.field}>
                            <label>Billing Address</label>
                            <span>{account?.billing_address || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Shipping Address</label>
                            <span>{account?.shipping_address || '-'}</span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Hierarchy & Ownership</h2>
                        <div className={styles.field}>
                            <label>Owner</label>
                            <span>{account?.owner || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Parent Account</label>
                            <span>{account?.parent_account || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={account}
                            entityType="account"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="account"
                            entityId={parseInt(id)}
                        />
                    </div>
                </div>

                {/* Column 3: Related Records */}
                <div className={styles.column}>
                    <div className={`${styles.detailCard} ${styles.relatedContactsCard}`}>
                        <h2>Related Contacts</h2>
                        {account?.contacts && account.contacts.length > 0 ? (
                            <ul>
                                {account.contacts.map(contact => (
                                    <li key={contact.id}>
                                        <Link to={`/contacts/${contact.id}`}>
                                            {contact.first_name} {contact.last_name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No contacts associated with this account.</p>
                        )}
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Related Opportunities</h2>
                        {account?.opportunities && account.opportunities.length > 0 ? (
                            <ul>
                                {account.opportunities.map((opp) => (
                                    <li key={opp.id}>
                                        <Link to={`/opportunities/${opp.id}`}>
                                            {opp.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No opportunities associated with this account.</p>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}

export default AccountPage;