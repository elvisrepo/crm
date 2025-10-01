import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPayment } from '../api/client';
import styles from './InvoiceDetail.module.css';

const PaymentDetailPage = () => {
    const { id } = useParams();
    const { data: payment, isLoading, isError, error } = useQuery({
        queryKey: ['payment', id],
        queryFn: () => getPayment(id),
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
        return <div className={styles.container}>Loading payment details...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error fetching payment: {error.message}</div>;
    }

    if (!payment) {
        return <div className={styles.container}>Payment not found.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.invoiceTitle}>Payment Details</h1>
                <span className={`${styles.status} ${getStatusClassName(payment.status)}`}>
                    {payment.status_display}
                </span>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Details</h2>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.detailGrid}>
                        <div>
                            <p className={styles.detailLabel}>Invoice</p>
                            <p className={styles.detailValue}><Link to={`/invoices/${payment.invoice.id}`}>{payment.invoice.invoice_number}</Link></p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Account</p>
                            <p className={styles.detailValue}><Link to={`/accounts/${payment.invoice.account.id}`}>{payment.invoice.account.name}</Link></p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Payment Date</p>
                            <p className={styles.detailValue}>{payment.payment_date}</p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Amount</p>
                            <p className={styles.detailValue}>${parseFloat(payment.amount).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Payment Method</p>
                            <p className={styles.detailValue}>{payment.payment_method_display}</p>
                        </div>
                        <div>
                            <p className={styles.detailLabel}>Transaction ID</p>
                            <p className={styles.detailValue}>{payment.transaction_id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {payment.notes && (
                 <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Notes</h2>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.notesText}>{payment.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentDetailPage;
