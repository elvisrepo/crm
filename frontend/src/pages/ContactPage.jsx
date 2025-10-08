import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getContact, deleteContact } from "../api/client";
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import styles from './ContactPage.module.css'; // Import styles
import { Link } from "react-router-dom";

const ContactPage = () => {
    const { id } = useParams();
     const queryClient = useQueryClient()
     const navigate = useNavigate()
     const { user } = useAuth();

    const { data: contact, isLoading, isError, error } = useQuery({
        queryKey: ['contact', id],
        queryFn: () => getContact(id),
    });

    const deleteContactMutation = useMutation({
     mutationFn: ({ id, version}) => deleteContact(id,version),
     onSuccess: () => {
        queryClient.invalidateQueries( {queryKey: ['contacts']})
        navigate('/contacts')
     },
     onError: (error) => {
            console.error("Error deleting contact:", error);
            alert(`Failed to delete contact: ${error.message || 'An unexpected error occurred.'}`);
        },
    })

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete contact ${contact?.first_name} ${contact?.last_name}?`)){
            if (contact?.id && contact?.version) {
                    deleteContactMutation.mutate({id:contact.id, version: contact.version})
            } else {
                alert("Contact data is incomplete for deletion.");
            }
        }
    }

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
                <div className={styles.actions}>
                    <Link to={`/contacts/${id}/edit`} className={`${styles.editButton} ${styles.button}`}>Edit</Link>
                    <button
                        onClick={handleDelete}
                        className={`${styles.deleteButton} ${styles.button}`}
                        disabled={deleteContactMutation.isLoading}
                    >
                        {deleteContactMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
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
                 <div className={styles.detailItemFull}>
                    <span className={styles.detailLabel}>Reports to:</span>
                    <span className={styles.detailValue}>
                        {contact.reports_to ? `${contact.reports_to.first_name} ${contact.reports_to.last_name}` : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Activity Management Section */}
            <div className={styles.activitySection}>
                <h2>Activities</h2>
                <ActivityQuickActions
                    entity={contact}
                    entityType="contact"
                    currentUser={user}
                />
                <ActivityTimeline
                    entityType="contact"
                    entityId={parseInt(id)}
                />
            </div>
        </div>
    );
};

export default ContactPage;