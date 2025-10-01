import styles from './ProductForm.module.css';

const PaymentForm = ({ onSubmit, onCancel, isLoading, error }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const paymentData = Object.fromEntries(formData.entries());
        onSubmit(paymentData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Record Payment</h2>
            <div className={styles.formGroup}>
                <label htmlFor="amount">Amount</label>
                <input type="number" id="amount" name="amount" step="0.01" required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="payment_date">Payment Date</label>
                <input type="date" id="payment_date" name="payment_date" required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="payment_method">Payment Method</label>
                <select id="payment_method" name="payment_method" required>
                    <option value="">Select a method</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="CHECK">Check</option>
                    <option value="WIRE">Wire Transfer</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="transaction_id">Transaction ID</label>
                <input type="text" id="transaction_id" name="transaction_id" />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes"></textarea>
            </div>
            <div className={styles.formActions}>
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                    {isLoading ? 'Submitting...' : 'Submit Payment'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Cancel
                </button>
            </div>
            {error && (
                <div className={styles.error}>{error.message}</div>
            )}
        </form>
    );
};

export default PaymentForm;
