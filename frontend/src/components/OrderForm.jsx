import { useState, useEffect } from 'react';
import styles from './OrderForm.module.css';

const OrderForm = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
    const [status, setStatus] = useState('Pending Fulfillment');

    useEffect(() => {
        const validStatuses = ['Pending Fulfillment', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];
        if (initialData) {
            const initialStatus = initialData.status;
            setStatus(validStatuses.includes(initialStatus) ? initialStatus : 'Pending Fulfillment');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ status });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Edit Order Status</h2>
            <div className={styles.formGroup}>
                <label htmlFor="status">Order Status</label>
                <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Pending Fulfillment">Pending Fulfillment</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            {error && <div className={styles.errorMessage}>{error.message}</div>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default OrderForm;
