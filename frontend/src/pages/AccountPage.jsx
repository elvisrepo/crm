import { useParams, Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getAccount } from "../api/client";
import styles from './AccountPage.module.css';

const AccountPage = () => {
    const { id } = useParams();

    const { data: account, isLoading, isError, error } = useQuery({
        queryKey: ['account', id],
        queryFn: () => getAccount(id),
    });

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
                    <button className={`${styles.deleteButton} ${styles.button}`}>Delete</button>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                    <h2>Account Details</h2>
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
        </div>
    );
}

export default AccountPage;