import { useState, useEffect } from 'react';
import styles from './OrderForm.module.css';

const OrderForm = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (initialData) {
            setStatus(initialData.status || '');
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
                    <option value="Awaiting Payment">Awaiting Payment</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid in Full">Paid in Full</option>
                    <option value="Fulfilled">Fulfilled</option>
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
