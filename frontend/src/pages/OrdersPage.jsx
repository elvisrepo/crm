import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/client';
import styles from './OrdersPage.module.css';

const OrdersPage = () => {
    const { data: orders, isLoading, isError, error } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    if (isLoading) {
        return <div className={styles.container}>Loading orders...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Orders</h1>
            </div>
            {orders && orders.length > 0 ? (
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Account</th>
                            <th>Opportunity</th>
                            <th>Status</th>
                            <th>Order Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td><Link to={`/orders/${order.id}`}>{order.id}</Link></td>
                                <td>{order.account_name || '-'}</td>
                                <td><Link to={`/opportunities/${order.opportunity}`}>{order.opportunity_name}</Link></td>
                                <td>{order.status}</td>
                                <td>{order.order_date}</td>
                                <td>${order.total_amount || '0.00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default OrdersPage;
