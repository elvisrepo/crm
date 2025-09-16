import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, updateOrder } from '../api/client';
import OrderForm from '../components/OrderForm';
import styles from './AccountsPage.module.css'; // Reusing styles

const EditOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: order, isLoading, isError, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(id),
    });

    const updateOrderMutation = useMutation({
        mutationFn: (orderData) => updateOrder(id, orderData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['order', id], exact: true });
            navigate(`/orders/${id}`);
        },
    });

    const handleSubmit = (formData) => {
        updateOrderMutation.mutate({ ...formData, version: order.version });
    };

    const handleCancel = () => {
        navigate(`/orders/${id}`);
    };

    if (isLoading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <OrderForm
                    initialData={order}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateOrderMutation.isLoading}
                    error={updateOrderMutation.error}
                />
            </div>
        </div>
    );
};

export default EditOrderPage;
