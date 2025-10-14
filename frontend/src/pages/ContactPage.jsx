import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getContact, deleteContact, createOpportunity, getAccounts } from "../api/client";
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import Modal from '../components/Modal';
import OpportunityForm from '../components/OpportunityForm';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './ContactPage.module.css'; // Import styles
import { Link } from "react-router-dom";

const ContactPage = () => {
    const { id } = useParams();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();
    const [isNewOpportunityModalOpen, setIsNewOpportunityModalOpen] = useState(false);

    const { data: contact, isLoading, isError, error } = useQuery({
        queryKey: ['contact', id],
        queryFn: () => getContact(id),
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
        enabled: isNewOpportunityModalOpen
    });

    const deleteContactMutation = useMutation({
        mutationFn: ({ id, version }) => deleteContact(id, version),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            navigate('/contacts')
        },
        onError: (error) => {
            console.error("Error deleting contact:", error);
            alert(`Failed to delete contact: ${error.message || 'An unexpected error occurred.'}`);
        },
    })

    const createOpportunityMutation = useMutation({
        mutationFn: (opportunityData) => {
            const dataToSubmit = {
                ...opportunityData,
                account_id: opportunityData.account_id || contact?.account?.id
            };
            return createOpportunity(dataToSubmit);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            queryClient.invalidateQueries({ queryKey: ['contact', id] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            if (contact?.account?.id) {
                queryClient.invalidateQueries({ queryKey: ['account', contact.account.id] });
            }
            setIsNewOpportunityModalOpen(false);
        },
        onError: (err) => {
            console.error('Error creating opportunity:', err);
        }
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete contact ${contact?.first_name} ${contact?.last_name}?`)) {
            if (contact?.id && contact?.version) {
                deleteContactMutation.mutate({ id: contact.id, version: contact.version })
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
                    <button onClick={() => setIsNewOpportunityModalOpen(true)} className={`${styles.primaryButton} ${styles.button}`}>
                        New Opportunity
                    </button>
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

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Contact Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}>
                            <label>Title</label>
                            <span>{contact.title || 'N/A'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Email</label>
                            <span>{contact.email || 'N/A'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Phone</label>
                            <span>{contact.phone || 'N/A'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Status</label>
                            <span>{contact.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Description</label>
                            <span>{contact.description || 'N/A'}</span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Hierarchy</h2>
                        <div className={styles.field}>
                            <label>Reports to</label>
                            <span>
                                {contact.reports_to ? `${contact.reports_to.first_name} ${contact.reports_to.last_name}` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.field}>
                            <label>Owner</label>
                            <span>{contact.owner?.first_name} {contact.owner?.last_name || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={contact}
                            entityType="contact"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="contact"
                            entityId={parseInt(id)}
                        />
                    </div>
                </div>

                {/* Column 3: Related Records */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>Related Account</h2>
                        <div className={styles.field}>
                            <label>Account</label>
                            <span>
                                {contact.account ? (
                                    <Link to={`/accounts/${contact.account.id}`}>
                                        {contact.account.name}
                                    </Link>
                                ) : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Related Opportunities</h2>
                        {contact.account?.opportunities && contact.account.opportunities.length > 0 ? (
                            <ul>
                                {contact.account.opportunities.map(opp => (
                                    <li key={opp.id}>
                                        <Link to={`/opportunities/${opp.id}`}>
                                            {opp.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No opportunities for this account.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* New Opportunity Modal */}
            <Modal isOpen={isNewOpportunityModalOpen} onClose={() => setIsNewOpportunityModalOpen(false)}>
                <OpportunityForm
                    onSubmit={createOpportunityMutation.mutate}
                    onCancel={() => setIsNewOpportunityModalOpen(false)}
                    isLoading={createOpportunityMutation.isLoading}
                    error={createOpportunityMutation.error}
                    accounts={accounts}
                    defaultAccountId={contact?.account?.id}
                />
            </Modal>
        </div>
    );
};

export default ContactPage;