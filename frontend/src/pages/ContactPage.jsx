import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getContact } from "../api/client";
import styles from './ContactPage.module.css'; // Import styles

const ContactPage = () => {
    const { id } = useParams();

    const { data: contact, isLoading, isError, error } = useQuery({
        queryKey: ['contact', id],
        queryFn: () => getContact(id),
    });

    if (isLoading) {
        return (
            <div className={styles.loading}>
                Loading contact details...
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.error}>
                Error: {error.message}
            </div>
        );
    }

    // Ensure contact data exists before rendering details
    if (!contact) {
        return (
            <div className={styles.notFound}>
                Contact not found.
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{contact.first_name} {contact.last_name}</h1>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Title:</span>
                    <span className={styles.detailValue}>{contact.title || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{contact.email || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <span className={styles.detailValue}>{contact.phone || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Account:</span>
                    <span className={styles.detailValue}>{contact.account?.name || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Owner:</span>
                    <span className={styles.detailValue}>{contact.owner?.first_name} {contact.owner?.last_name || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.detailValue}>{contact.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className={styles.detailItemFull}>
                    <span className={styles.detailLabel}>Description:</span>
                    <span className={styles.detailValue}>{contact.description || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;