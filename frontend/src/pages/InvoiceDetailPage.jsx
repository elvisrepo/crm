
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoice, logPaymentForInvoice } from '../api/client';
import styles from './InvoiceDetail.module.css';
import Modal from 'react-modal';
import { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';

Modal.setAppElement('#root');

const InvoiceDetailPage = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { data: invoice, isLoading, isError, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => getInvoice(id),
    });

    const mutation = useMutation({
        mutationFn: (paymentData) => logPaymentForInvoice(id, paymentData),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoice', id]);
            closeModal();
        },
    });

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

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
                <button onClick={openModal} className={styles.recordPaymentButton}>Record Payment</button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Record Payment"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <PaymentForm
                    onSubmit={mutation.mutate}
                    onCancel={closeModal}
                    isLoading={mutation.isLoading}
                    error={mutation.error}
                />
            </Modal>

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Invoice Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}>
                            <label>Account</label>
                            <span><Link to={`/accounts/${invoice.account.id}`}>{invoice.account.name}</Link></span>
                        </div>
                        <div className={styles.field}>
                            <label>Issue Date</label>
                            <span>{invoice.issue_date}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Due Date</label>
                            <span>{invoice.due_date}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Source</label>
                            <span>
                                {invoice.order && <Link to={`/orders/${invoice.order}`}>Order: {invoice.order_str}</Link>}
                                {invoice.contract && <Link to={`/contracts/${invoice.contract}`}>Contract: {invoice.contract_str}</Link>}
                            </span>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <h2>Summary</h2>
                        <div className={styles.field}>
                            <label>Total Amount</label>
                            <span className={styles.totalValue}>${parseFloat(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Balance Due</label>
                            <span className={styles.balanceDue}>${parseFloat(invoice.balance_due).toFixed(2)}</span>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className={styles.detailCard}>
                            <h2>Notes</h2>
                            <p className={styles.notesText}>{invoice.notes}</p>
                        </div>
                    )}
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={invoice}
                            entityType="invoice"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="invoice"
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
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
