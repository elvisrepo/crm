import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLead, deleteLead } from "../api/client";
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './LeadPage.module.css';

export default function LeadPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();

    const { data: lead, isLoading, isError, error } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => getLead(id),
    });

    const deleteLeadMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            navigate('/leads');
        },
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this lead?`)) {
            deleteLeadMutation.mutate({ id: lead.id, version: lead.version });
        }
    };

    if (isLoading) return <div className={styles.container}>Loading...</div>;
    if (isError) return <div className={styles.container}>Error: {error.message}</div>;
    if (!lead) return <div className={styles.container}>Lead not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{lead.first_name} {lead.last_name}</h1>
                <div className={styles.actions}>
                    <Link to={`/leads/${id}/convert`} className={`${styles.convertButton} ${styles.button}`}>Convert</Link>
                    <Link to={`/leads/${id}/edit`} className={`${styles.editButton} ${styles.button}`}>Edit</Link>
                    <button onClick={handleDelete} className={`${styles.deleteButton} ${styles.button}`} disabled={deleteLeadMutation.isLoading}>
                        {deleteLeadMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Lead Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}><label>Company</label><span>{lead.company}</span></div>
                        <div className={styles.field}><label>Title</label><span>{lead.title || '-'}</span></div>
                        <div className={styles.field}><label>Email</label><span>{lead.email || '-'}</span></div>
                        <div className={styles.field}><label>Phone</label><span>{lead.phone || '-'}</span></div>
                        <div className={styles.field}><label>Website</label><span>{lead.website ? <a href={lead.website} target="_blank" rel="noopener noreferrer">{lead.website}</a> : '-'}</span></div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Address Information</h2>
                        <div className={styles.field}><label>Billing Address</label><span>{lead.billing_address || '-'}</span></div>
                        <div className={styles.field}><label>Shipping Address</label><span>{lead.shipping_address || '-'}</span></div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Status & Source</h2>
                        <div className={styles.field}><label>Status</label><span>{lead.status}</span></div>
                        <div className={styles.field}><label>Lead Source</label><span>{lead.lead_source || '-'}</span></div>
                        <div className={styles.field}><label>Industry</label><span>{lead.industry || '-'}</span></div>
                        <div className={styles.field}><label>Owner</label><span>{lead.owner_username}</span></div>
                    </div>
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={lead}
                            entityType="lead"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="lead"
                            entityId={parseInt(id)}
                        />
                    </div>
                </div>

                {/* Column 3: Additional Info (placeholder for future use) */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>Notes</h2>
                        <p className={styles.placeholder}>Additional information can be added here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
