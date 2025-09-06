import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunity, deleteOpportunity } from '../api/client';
import styles from './OpportunityPage.module.css';

const OpportunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: opportunity, isLoading, isError, error } = useQuery({
        queryKey: ['opportunity', id],
        queryFn: () => getOpportunity(id),
    });

    const deleteOpportunityMutation = useMutation({
        mutationFn: deleteOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunities']);
            navigate('/opportunities');
        },
    });

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            deleteOpportunityMutation.mutate({ id: opportunity.id, version: opportunity.version });
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading opportunity details...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    if (!opportunity) {
        return <div className={styles.container}>Opportunity not found.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{opportunity.name}</h1>
                <div className={styles.actions}>
                    <Link to={`/opportunities/${opportunity.id}/edit`} className={styles.editButton}>
                        Edit Opportunity
                    </Link>
                    <button onClick={handleDelete} className={styles.deleteButton} disabled={deleteOpportunityMutation.isLoading}>
                        {deleteOpportunityMutation.isLoading ? 'Deleting...' : 'Delete Opportunity'}
                    </button>
                </div>
            </div>

            <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Account:</span>
                    <span className={styles.detailValue}>{opportunity.account?.name || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Stage:</span>
                    <span className={styles.detailValue}>{opportunity.stage}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Close Date:</span>
                    <span className={styles.detailValue}>{opportunity.close_date || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Description:</span>
                    <span className={styles.detailValue}>{opportunity.description || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Next Step:</span>
                    <span className={styles.detailValue}>{opportunity.next_step || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Owner:</span>
                    <span className={styles.detailValue}>{opportunity.owner?.first_name} {opportunity.owner?.last_name || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Created At:</span>
                    <span className={styles.detailValue}>{new Date(opportunity.created_at).toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Last Updated:</span>
                    <span className={styles.detailValue}>{new Date(opportunity.updated_at).toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Version:</span>
                    <span className={styles.detailValue}>{opportunity.version}</span>
                </div>
            </div>
        </div>
    );
};

export default OpportunityPage;