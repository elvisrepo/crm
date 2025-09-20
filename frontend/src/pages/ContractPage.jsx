import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getContract } from '../api/client';
import styles from './ContractPage.module.css';

const ContractPage = () => {
    const { id } = useParams();

    const { data: contract, isLoading, isError, error } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => getContract(id),
    });

    if (isLoading) {
        return <div className={styles.container}>Loading contract details...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    if (!contract) {
        return <div className={styles.container}>Contract not found.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Contract #{contract.id}</h1>
                <div className={styles.actions}>
                    <Link to={`/contracts/${contract.id}/edit`} className={styles.editButton}>
                        Edit Contract
                    </Link>
                </div>
            </div>

            <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Total Per Cycle:</span>
                    <span className={`${styles.detailValue} ${styles.totalValue}`}>${contract.total_amount_per_cycle}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Account:</span>
                    <span className={styles.detailValue}><Link to={`/accounts/${contract.account}`}>{contract.account_name || '-'}</Link></span>
                </div>
                 <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Opportunity:</span>
                    <span className={styles.detailValue}><Link to={`/opportunities/${contract.opportunity}`}>{contract.opportunity_name}</Link></span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.detailValue}>{contract.status}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Start Date:</span>
                    <span className={styles.detailValue}>{contract.start_date || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>End Date:</span>
                    <span className={styles.detailValue}>{contract.end_date || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Billing Cycle:</span>
                    <span className={styles.detailValue}>{contract.billing_cycle}</span>
                </div>
            </div>

            <div className={styles.lineItemsCard}>
                <div className={styles.cardHeader}>
                    <h2>Line Items</h2>
                </div>
                <table className={styles.lineItemsTable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price Per Cycle</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contract.line_items?.length > 0 ? (
                            contract.line_items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${parseFloat(item.price_per_cycle).toFixed(2)}</td>
                                    <td>${(item.quantity * parseFloat(item.price_per_cycle)).toFixed(2)}</td>
                                    
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={styles.noItems}>No line items for this contract.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContractPage;
