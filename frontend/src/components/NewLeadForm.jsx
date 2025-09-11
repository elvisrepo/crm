import { useState, useEffect } from 'react';
import styles from './NewLeadForm.module.css';

const NewLeadForm = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        website: '',
        billing_address: '',
        shipping_address: '',
        status: 'New',
        lead_source: '',
        industry: '',
        version: null,
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                company: initialData.company || '',
                title: initialData.title || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                website: initialData.website || '',
                billing_address: initialData.billing_address || '',
                shipping_address: initialData.shipping_address || '',
                status: initialData.status || 'New',
                lead_source: initialData.lead_source || '',
                industry: initialData.industry || '',
                version: initialData.version, // Important for optimistic locking
            });
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submittedData = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== '' && value !== null)
        );
        onSubmit(submittedData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{isEditMode ? 'Edit Lead' : 'New Lead'}</h2>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="first_name">First Name</label>
                    <input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="last_name">Last Name*</label>
                    <input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} required />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="company">Company*</label>
                <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} required />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" type="url" value={formData.website} onChange={handleChange} />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="billing_address">Billing Address</label>
                <textarea id="billing_address" name="billing_address" rows="2" value={formData.billing_address} onChange={handleChange}></textarea>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="shipping_address">Shipping Address</label>
                <textarea id="shipping_address" name="shipping_address" rows="2" value={formData.shipping_address} onChange={handleChange}></textarea>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="lead_source">Lead Source</label>
                    <select id="lead_source" name="lead_source" value={formData.lead_source} onChange={handleChange}>
                        <option value="">---------</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Partner">Partner</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="industry">Industry</label>
                <input id="industry" name="industry" type="text" value={formData.industry} onChange={handleChange} />
            </div>

            {error && <div className={styles.errorMessage}>{error.message}</div>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Lead')}
                </button>
            </div>
        </form>
    );
};

export default NewLeadForm;
