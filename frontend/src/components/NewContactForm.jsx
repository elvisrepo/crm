import { useState } from "react";
import styles from './NewContactForm.module.css';
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "../api/client";

// Correct prop destructuring
const NewContactForm = ({ onSubmit, onCancel, isLoading, error, contacts }) => {

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts
    });

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        title: '', // Add this line
        account: '', // This should be the account ID
        reports_to: '', // This should be the contact ID
        email: '',
        phone: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle number conversion for account and reports_to if needed,
        // but for select elements, the value is usually a string ID.
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure account and reports_to are numbers if the backend expects them as such
        const dataToSend = {
            ...formData,
            account_id: formData.account ? Number(formData.account) : null,
            reports_to: formData.reports_to ? Number(formData.reports_to) : null,
        };
        // Remove the original 'account' field if it's not needed
        delete dataToSend.account;

        onSubmit(dataToSend);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>New Contact</h2>

            {error && <div className={styles.errorMessage}>{error.message}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="first_name">Contact First Name</label>
                <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="last_name">Contact Last Name</label>
                <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <select
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Dr">Dr.</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="account">Account</label>
                <select
                    id="account"
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select an Account</option>
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="reports_to">Reports To</label>
                <select
                    id="reports_to"
                    name="reports_to"
                    value={formData.reports_to}
                    onChange={handleChange}
                >
                    <option value="">None</option>
                    {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                ></textarea>
            </div>

            <div className={styles.formActions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={`${styles.button} ${styles.cancelButton}`}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`${styles.button} ${styles.submitButton}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Create Contact'}
                </button>
            </div>
        </form>
    );
};

export default NewContactForm;