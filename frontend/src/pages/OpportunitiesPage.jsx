import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunities, createOpportunity, getAccounts } from '../api/client';
import Modal from '../components/Modal';
import OpportunityForm from '../components/OpportunityForm';
import styles from './OpportunitiesPage.module.css';

const OpportunitiesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: opportunities = [], isLoading, isError, error } = useQuery({
        queryKey: ['opportunities'],
        queryFn: getOpportunities,
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const createOpportunityMutation = useMutation({
        mutationFn: createOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunities']);
            setIsModalOpen(false);
        },
    });

    const filteredOpportunities = opportunities.filter(opp =>
        opp.is_active && opp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading opportunities...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error.message}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Opportunities</h1>
                <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>
                    New Opportunity
                </button>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Opportunity Name</th>
                            <th>Account</th>
                            <th>Stage</th>
                            <th>Close Date</th>
                            <th>Owner</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOpportunities.map((opp) => (
                            <tr key={opp.id}>
                                <td>
                                    <Link to={`/opportunities/${opp.id}`} className={styles.accountLink}>
                                        {opp.name}
                                    </Link>
                                </td>
                                <td>{opp.account?.name || '-'}</td>
                                <td className={styles.type}>{opp.stage}</td>
                                <td>{opp.close_date || '-'}</td>
                                <td>{opp.owner?.first_name} {opp.owner?.last_name || ''}</td>
                                <td>
                                    <Link to={`/opportunities/${opp.id}/edit`} className={styles.editButton}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredOpportunities.length} of {opportunities.length} opportunities
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <OpportunityForm
                    accounts={accounts}
                    onSubmit={createOpportunityMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createOpportunityMutation.isLoading}
                    error={createOpportunityMutation.error}
                />
            </Modal>
        </div>
    );
};

export default OpportunitiesPage;

