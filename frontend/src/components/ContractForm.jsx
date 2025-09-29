import { useState, useEffect } from 'react';
import styles from './ContractForm.module.css';

const ContractForm = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
    

    const [formData, setFormData] = useState({
        status: 'Draft',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        const validStatuses = ['Draft', 'Active', 'Expired', 'Terminated', 'Cancelled'];
        if (initialData) {
            const initialStatus = initialData.status;
            setFormData({
                status: validStatuses.includes(initialStatus) ? initialStatus : 'Draft',
                start_date: initialData.start_date || '',
                end_date: initialData.end_date || '',
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
            
            <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="start_date">Start Date</label>
                <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="end_date">End Date</label>
                <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                />
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

export default ContractForm;

