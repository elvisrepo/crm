import styles from './NewContactForm.module.css';
import { useState, useEffect } from 'react';

const EditContactForm = ({initialData, onSubmit, onCancel, isLoading, error, accounts, contacts}) => {

     const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        title: '',
        account: '', // This should be the account ID
        reports_to: '', // This should be the contact ID
        email: '',
        phone: '',
        description: ''
    });


    useEffect(() => {
        if(initialData) {
            setFormData({
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                title: initialData.title || '',
                account: initialData.account || '',
                reports_to: initialData.reports_to || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                description: initialData.description || ''
            })
        }
    },[initialData])


    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}))
    }

    const handleSubmit = (e) => {
         e.preventDefault();
        onSubmit(formData);
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Edit Contact</h2>
            {error && <div className={styles.error}>{error.message}</div>}

            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label>First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className={styles.formField}>
                    <label>Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label>Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} />
                </div>
                <div className={styles.formField}>
                    <label>Account</label>
                    <select name="account" value={formData.account} onChange={handleChange}>
                        <option value="">Select Account</option>
                        {accounts.map(account => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.formRow}>
                 <div className={styles.formField}>
                    <label>Reports To</label>
                    <select name="reports_to" value={formData.reports_to || ''} onChange={handleChange}>
                        <option value="">Select Contact</option>
                        {contacts
                            .filter(contact => contact.id !== initialData.id) // Exclude self
                            .map(contact => (
                            <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formField}>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
            </div>

            <div className={styles.formField}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}


export default EditContactForm