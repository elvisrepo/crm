import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunity, updateOpportunity, deleteOpportunity, getAccounts } from '../api/client';
import OpportunityForm from '../components/OpportunityForm';
import styles from './AccountsPage.module.css'; // Reusing styles for consistency

const EditOpportunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: opportunity, isLoading: isLoadingOpportunity, isError, error } = useQuery({
        queryKey: ['opportunity', id],
        queryFn: () => getOpportunity(id),
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const updateOpportunityMutation = useMutation({
        mutationFn: (opportunityData) => updateOpportunity(id, opportunityData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['opportunity', id], exact: true });
            navigate('/opportunities');
        },
    });

    const deleteOpportunityMutation = useMutation({
        mutationFn: (version) => deleteOpportunity(id, version),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'], exact: true });
            navigate('/opportunities');
        },
    });

    const handleSubmit = (formData) => {
        updateOpportunityMutation.mutate({ ...formData, version: opportunity.version });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            deleteOpportunityMutation.mutate(opportunity.version);
        }
    };

    const handleCancel = () => {
        navigate('/opportunities');
    };

    if (isLoadingOpportunity) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <OpportunityForm
                    initialData={opportunity}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateOpportunityMutation.isLoading}
                    error={updateOpportunityMutation.error}
                    accounts={accounts}
                />
                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button onClick={handleDelete} className={`${styles.button} ${styles.deleteButton}`} disabled={deleteOpportunityMutation.isLoading}>
                        {deleteOpportunityMutation.isLoading ? 'Deleting...' : 'Delete Opportunity'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOpportunityPage;
