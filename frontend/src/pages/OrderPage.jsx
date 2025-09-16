import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../api/client';
import styles from './OrderPage.module.css';

const OrderPage = () => {
    const { id } = useParams();

    const { data: order, isLoading, isError, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(id),
    });

    if (isLoading) {
        return <div className={styles.container}>Loading order details...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    if (!order) {
        return <div className={styles.container}>Order not found.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Order #{order.id}</h1>
                <div className={styles.actions}>
                    <Link to={`/orders/${order.id}/edit`} className={styles.editButton}>
                        Edit Order
                    </Link>
                </div>
            </div>

            <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Total Value:</span>
                    <span className={`${styles.detailValue} ${styles.totalValue}`}>${order.total_amount}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Account:</span>
                    <span className={styles.detailValue}><Link to={`/accounts/${order.account}`}>{order.account_name || '-'}</Link></span>
                </div>
                 <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Opportunity:</span>
                    <span className={styles.detailValue}><Link to={`/opportunities/${order.opportunity}`}>{order.opportunity_name}</Link></span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.detailValue}>{order.status}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Order Date:</span>
                    <span className={styles.detailValue}>{order.order_date || '-'}</span>
                </div>
                 <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Owner:</span>
                    <span className={styles.detailValue}>{order.owner?.first_name} {order.owner?.last_name || '-'}</span>
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
                            <th>Price at Purchase</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.line_items?.length > 0 ? (
                            order.line_items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                                    <td>${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={styles.noItems}>No line items for this order.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderPage;
