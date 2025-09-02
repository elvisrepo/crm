import { useState } from 'react';
import styles from './NewAccountForm.module.css';

const NewAccountForm = ({ onSubmit, onCancel, isLoading, error, accounts }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        website: '',
        type: 'prospect',
        description: '',
        billing_address: '',
        shipping_address: '',
        parent_account: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>New Account</h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">Account Name*</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="partner">Partner</option>
                    <option value="competitor">Competitor</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="billing_address">Billing Address</label>
                <textarea
                    id="billing_address"
                    name="billing_address"
                    rows="3"
                    value={formData.billing_address}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="parent_account">Parent Account</label>
                <select id="parent_account" name="parent_account" value={formData.parent_account} onChange={handleChange}>
                    <option value="">None</option>
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                    ))}
                </select>
            </div>
            {error && <div className={styles.errorMessage}>{error.message}</div>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default NewAccountForm;
