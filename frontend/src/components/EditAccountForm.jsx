import { useState, useEffect } from 'react';
import styles from './NewAccountForm.module.css'; // Reuse styles for consistency

const EditAccountForm = ({ initialData, onSubmit, onCancel, isLoading, error, accounts }) => {
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

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phone: initialData.phone || '',
                website: initialData.website || '',
                type: initialData.type || 'prospect',
                description: initialData.description || '',
                billing_address: initialData.billing_address || '',
                shipping_address: initialData.shipping_address || '',
                parent_account: initialData.parent_account || '',
            });
        }
    }, [initialData]);

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
            <h2>Edit Account</h2>
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
                <select id="parent_account" name="parent_account" value={formData.parent_account || ''} onChange={handleChange}>
                    <option value="">None</option>
                    {accounts?.filter(acc => acc.id !== initialData.id).map(account => (
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

export default EditAccountForm;


/**
 * 
 * setFormData can take either a new state value directly or a function that receives the previous
         state (prev) as an argument. Using a function is the recommended way when your new state depends
         on the previous state, as it ensures you're working with the most up-to-date state.

         `[name]: value` (Computed Property Name): This is a powerful JavaScript feature. The [name]
             part means that the key of this new property will be determined by the value of the name
             variable.
               * If name is "firstName", this becomes firstName: "john".
               * If name is "email", this becomes email: "new@example.com".
           * Because [name]: value comes after ...prev, if a property with that name already exists in
             prev, its value will be overwritten with the new value. All other properties from prev
             remain unchanged.

 */