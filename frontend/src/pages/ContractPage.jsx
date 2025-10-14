import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContract, generateInvoiceFromContract } from '../api/client';
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './ContractPage.module.css';

const ContractPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();

    const { data: contract, isLoading, isError, error } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => getContract(id),
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: () => generateInvoiceFromContract(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            navigate(`/invoices/${data.id}`);
        },
        onError: (error) => {
            console.error("Error generating invoice:", error);
        }
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
                    <button 
                        onClick={() => generateInvoiceMutation.mutate()}
                        className={styles.generateButton}
                        disabled={generateInvoiceMutation.isPending}
                    >
                        {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                    </button>
                </div>
            </div>

            {generateInvoiceMutation.isError && (
                <div className={styles.errorBanner}>
                    Failed to generate invoice: {generateInvoiceMutation.error.response?.data?.error || generateInvoiceMutation.error.message}
                </div>
            )}

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Contract Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}>
                            <label>Total Per Cycle</label>
                            <span className={styles.totalValue}>${contract.total_amount_per_cycle}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Status</label>
                            <span>{contract.status}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Start Date</label>
                            <span>{contract.start_date || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>End Date</label>
                            <span>{contract.end_date || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Billing Cycle</label>
                            <span>{contract.billing_cycle}</span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Related Records</h2>
                        <div className={styles.field}>
                            <label>Account</label>
                            <span>
                                <Link to={`/accounts/${contract.account}`}>{contract.account_name || '-'}</Link>
                            </span>
                        </div>
                        <div className={styles.field}>
                            <label>Opportunity</label>
                            <span>
                                <Link to={`/opportunities/${contract.opportunity}`}>{contract.opportunity_name}</Link>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={contract}
                            entityType="contract"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="contract"
                            entityId={parseInt(id)}
                        />
                    </div>
                </div>

                {/* Column 3: Line Items */}
                <div className={styles.column}>
                    <div className={styles.lineItemsCard}>
                        <div className={styles.cardHeader}>
                            <h2>Line Items</h2>
                        </div>
                        <table className={styles.lineItemsTable}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
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
                                        <td colSpan="4" className={styles.noItems}>No line items.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractPage;
