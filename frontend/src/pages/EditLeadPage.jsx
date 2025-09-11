import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLead, updateLead } from '../api/client';
import NewLeadForm from '../components/NewLeadForm';
import styles from './EditLeadPage.module.css';

export default function EditLeadPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: lead, isLoading, isError, error } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => getLead(id),
    });

    const updateLeadMutation = useMutation({
        mutationFn: (updatedData) => updateLead(id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead', id] });
            navigate(`/leads/${id}`);
        },
    });

    const handleSubmit = (formData) => {
        updateLeadMutation.mutate(formData);
    };

    if (isLoading) return <div className={styles.container}>Loading lead data...</div>;
    if (isError) return <div className={styles.container}>Error: {error.message}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Edit Lead</h1>
                <Link to={`/leads/${id}`} className={styles.cancelLink}>Cancel</Link>
            </div>
            <NewLeadForm
                initialData={lead}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/leads/${id}`)}
                isLoading={updateLeadMutation.isLoading}
                error={updateLeadMutation.error}
            />
        </div>
    );
}
