import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOpportunities } from '../api/client';
import styles from './OpportunitiesPage.module.css';

const OpportunitiesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: opportunities = [], isLoading, isError, error } = useQuery({
        queryKey: ['opportunities'],
        queryFn: getOpportunities,
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
                {/* Placeholder for New Opportunity button as requested */}
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
        </div>
    );
};

export default OpportunitiesPage;
