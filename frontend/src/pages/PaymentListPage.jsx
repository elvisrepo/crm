import { useQuery } from '@tanstack/react-query';
import { getPayments } from '../api/client';
import { Link } from 'react-router-dom';
import styles from './InvoiceList.module.css';

const PaymentListPage = () => {
    const { data: payments, isLoading, isError, error } = useQuery({
        queryKey: ['payments'],
        queryFn: getPayments,
    });

    const getStatusClassName = (status) => {
        switch (status) {
            case 'Completed':
                return styles.statusPaid;
            case 'Pending':
                return styles.statusAwaiting;
            case 'Failed':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading payments...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error fetching payments: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Payments</h1>
            <div className={styles.tableContainer}>
                <table className={styles.invoiceTable}>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Account</th>
                            <th>Payment Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments && payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td><Link to={`/invoices/${payment.invoice.id}`}>{payment.invoice.invoice_number}</Link></td>
                                    <td>{payment.invoice.account.name}</td>
                                    <td>{payment.payment_date}</td>
                                    <td>${parseFloat(payment.amount).toFixed(2)}</td>
                                    <td>{payment.payment_method_display}</td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClassName(payment.status)}`}>
                                            {payment.status_display}
                                        </span>
                                    </td>
                                    <td>{payment.transaction_id}</td>
                                    <td>
                                        <Link to={`/payments/${payment.id}`} className={styles.detailsLink}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No payments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentListPage;
