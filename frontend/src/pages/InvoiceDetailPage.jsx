
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoice } from '../api/client';
import styles from './InvoiceDetail.module.css';

const InvoiceDetailPage = () => {
    const { id } = useParams();
    const { data: invoice, isLoading, isError, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => getInvoice(id),
    });

    const getStatusClassName = (status) => {
        switch (status) {
            case 'Paid in Full':
                return styles.statusPaid;
            case 'Partially Paid':
                return styles.statusPartial;
            case 'Awaiting Payment':
                return styles.statusAwaiting;
            case 'Cancelled':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading invoice details...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error fetching invoice: {error.message}</div>;
    }

    if (!invoice) {
        return <div className={styles.container}>Invoice not found.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.invoiceTitle}>Invoice {invoice.invoice_number}</h1>
                <span className={`${styles.status} ${getStatusClassName(invoice.status)}`}>
                    {invoice.status_display}
                </span>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Details</h2>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.detailGrid}>
                        <div>
                            <p className={styles.detailLabel}>Account</p>
                            <p className={styles.detailValue}><Link to={`/accounts/${invoice.account.id}`}>{invoice.account.name}</Link></p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Issue Date</p>
                            <p className={styles.detailValue}>{invoice.issue_date}</p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Due Date</p>
                            <p className={styles.detailValue}>{invoice.due_date}</p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Source</p>
                            <p className={styles.detailValue}>
                                {invoice.order && <Link to={`/orders/${invoice.order}`}>Order: {invoice.order_str}</Link>}
                                {invoice.contract && <Link to={`/contracts/${invoice.contract}`}>Contract: {invoice.contract_str}</Link>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Line Items</h2>
                </div>
                <div className={styles.cardBody}>
                    <table className={styles.lineItemsTable}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.line_items && invoice.line_items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.summaryCard}>
                 <div className={styles.summaryGrid}>
                    <div>
                        <p className={styles.summaryLabel}>Total Amount</p>
                        <p className={styles.summaryValue}>${parseFloat(invoice.total_amount).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className={styles.summaryLabel}>Balance Due</p>
                        <p className={`${styles.summaryValue} ${styles.balanceDue}`}>${parseFloat(invoice.balance_due).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {invoice.notes && (
                 <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Notes</h2>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.notesText}>{invoice.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetailPage;
