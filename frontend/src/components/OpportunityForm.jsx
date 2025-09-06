import { useState, useEffect } from 'react';
import styles from './OpportunityForm.module.css';

const OpportunityForm = ({ initialData, onSubmit, onCancel, isLoading, error, accounts }) => {
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        name: '',
        account_id: '',
        stage: 'prospecting',
        close_date: '',
        description: '',
        next_step: '',
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                name: initialData.name || '',
                account_id: initialData.account?.id || '',
                stage: initialData.stage || 'prospecting',
                close_date: initialData.close_date || '',
                description: initialData.description || '',
                next_step: initialData.next_step || '',
            });
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter out empty fields before submitting
        const submittedData = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== '')
        );
        onSubmit(submittedData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{isEditMode ? 'Edit Opportunity' : 'New Opportunity'}</h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">Opportunity Name*</label>
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
                <label htmlFor="account_id">Account*</label>
                <select
                    id="account_id"
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select an Account</option>
                    {accounts?.map(account => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="stage">Stage</label>
                <select id="stage" name="stage" value={formData.stage} onChange={handleChange}>
                    <option value="qualification">Qualification</option>
                    <option value="meet_present">Meet Present</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="close_date">Close Date</label>
                <input
                    id="close_date"
                    name="close_date"
                    type="date"
                    value={formData.close_date}
                    onChange={handleChange}
                />
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
                <label htmlFor="next_step">Next Step</label>
                <textarea
                    id="next_step"
                    name="next_step"
                    rows="2"
                    value={formData.next_step}
                    onChange={handleChange}
                ></textarea>
            </div>
            {error && <div className={styles.errorMessage}>{error.message}</div>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Opportunity')}
                </button>
            </div>
        </form>
    );
};



export default OpportunityForm;
