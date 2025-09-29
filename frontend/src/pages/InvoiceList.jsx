
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../api/client';
import { Link } from 'react-router-dom';
import styles from './InvoiceList.module.css';

const InvoiceListPage = () => {
    const { data: invoices, isLoading, isError, error } = useQuery({
        queryKey: ['invoices'],
        queryFn: getInvoices,
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
        return <div className={styles.container}>Loading invoices...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error fetching invoices: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Invoices</h1>
            <div className={styles.tableContainer}>
                <table className={styles.invoiceTable}>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Account</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Balance Due</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices && invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoice_number}</td>
                                    <td>{invoice.account?.name || 'N/A'}</td>
                                    <td>
                                        {invoice.order && <Link to={`/orders/${invoice.order}`} className={styles.sourceLink}>Order</Link>}
                                        {invoice.contract && <Link to={`/contracts/${invoice.contract}`} className={styles.sourceLink}>Contract</Link>}
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClassName(invoice.status)}`}>
                                            {invoice.status_display}
                                        </span>
                                    </td>
                                    <td>{invoice.issue_date}</td>
                                    <td>{invoice.due_date}</td>
                                    <td>${parseFloat(invoice.balance_due).toFixed(2)}</td>
                                    <td>
                                        <Link to={`/invoices/${invoice.id}`} className={styles.detailsLink}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No invoices found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceListPage;
