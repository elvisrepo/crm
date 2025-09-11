import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLead, convertLead } from '../api/client';
import styles from './ConvertLeadPage.module.css';

export default function ConvertLeadPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [opportunityName, setOpportunityName] = useState('');
    const [closeDate, setCloseDate] = useState('');
    const [createOpportunity, setCreateOpportunity] = useState(true);

    const { data: lead, isLoading, isError, error } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => getLead(id),
        onSuccess: (data) => {
            // Pre-fill the opportunity name once the lead data is loaded
            setOpportunityName(`${data.company} - Opportunity`);
        }
    });

    const convertLeadMutation = useMutation({
        mutationFn: (conversionData) => convertLead({ id, conversionData }),
        onSuccess: (data) => {
            // Invalidate queries to refetch data on other pages
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            // Navigate to the newly created account's page
            navigate(`/accounts/${data.account_id}`);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const conversionData = {
            create_opportunity: createOpportunity,
            opportunity_name: createOpportunity ? opportunityName : '',
            opportunity_close_date: createOpportunity ? closeDate : null,
        };
        convertLeadMutation.mutate(conversionData);
    };

    if (isLoading) return <div className={styles.container}>Loading lead data...</div>;
    if (isError) return <div className={styles.container}>Error: {error.message}</div>;

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.header}>
                    <h1>Convert Lead</h1>
                    <p>Converting: {lead?.first_name} {lead?.last_name} from {lead?.company}</p>
                </div>

                <div className={styles.infoSection}>
                    <p>A new Account and Contact will be created with the following information. If an Account or Contact with the same name or email already exists, the existing record will be used.</p>
                    <div className={styles.dataGrid}>
                        <div>
                            <strong>New Account:</strong>
                            <span>{lead?.company}</span>
                        </div>
                        <div>
                            <strong>New Contact:</strong>
                            <span>{lead?.first_name} {lead?.last_name} ({lead?.email})</span>
                        </div>
                    </div>
                </div>

                <div className={styles.opportunitySection}>
                    <h2>Opportunity Creation</h2>
                    <div className={styles.formGroupCheckbox}>
                        <input
                            type="checkbox"
                            id="create_opportunity"
                            checked={createOpportunity}
                            onChange={(e) => setCreateOpportunity(e.target.checked)}
                        />
                        <label htmlFor="create_opportunity">Create a new Opportunity upon conversion</label>
                    </div>

                    {createOpportunity && (
                        <div className={styles.opportunityForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="opportunityName">Opportunity Name*</label>
                                <input
                                    id="opportunityName"
                                    type="text"
                                    value={opportunityName}
                                    onChange={(e) => setOpportunityName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="closeDate">Close Date</label>
                                <input
                                    id="closeDate"
                                    type="date"
                                    value={closeDate}
                                    onChange={(e) => setCloseDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {convertLeadMutation.error && (
                    <div className={styles.errorMessage}>
                        {convertLeadMutation.error.message}
                    </div>
                )}

                <div className={styles.formActions}>
                    <Link to={`/leads/${id}`} className={`${styles.button} ${styles.cancelButton}`}>Cancel</Link>
                    <button type="submit" className={`${styles.button} ${styles.convertButton}`} disabled={convertLeadMutation.isLoading}>
                        {convertLeadMutation.isLoading ? 'Converting...' : 'Convert Lead'}
                    </button>
                </div>
            </form>
        </div>
    );
}
