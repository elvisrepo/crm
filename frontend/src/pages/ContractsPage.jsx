
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getContracts } from '../api/client';
import styles from './OrdersPage.module.css';

const ContractsPage = () => {
    const { data: contracts, isLoading, isError, error } = useQuery({
        queryKey: ['contracts'],
        queryFn: getContracts,
    });

    if (isLoading) {
        return <div className={styles.container}>Loading contracts...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Contracts</h1>
            </div>
            {contracts && contracts.length > 0 ? (
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>Contract ID</th>
                            <th>Account</th>
                            <th>Opportunity</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Billing Cycle</th>
                            <th>Total Per Cycle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map(contract => (
                            <tr key={contract.id}>
                                <td><Link to={`/contracts/${contract.id}`}>{contract.id}</Link></td>
                                <td>{contract.account_name || '-'}</td>
                                <td><Link to={`/opportunities/${contract.opportunity}`}>{contract.opportunity_name}</Link></td>
                                <td>{contract.status}</td>
                                <td>{contract.start_date}</td>
                                <td>{contract.end_date}</td>
                                <td>{contract.billing_cycle}</td>
                                <td>${contract.total_amount_per_cycle || '0.00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No contracts found.</p>
            )}
        </div>
    );
};

export default ContractsPage;