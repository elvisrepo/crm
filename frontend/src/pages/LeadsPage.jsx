import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, createLead } from '../api/client';
import styles from './LeadsPage.module.css';
import Modal from '../components/Modal';
import NewLeadForm from '../components/NewLeadForm'; // This will be created in the next step

export default function LeadsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: leads = [], isLoading, isError, error } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            setIsModalOpen(false);
        },
    });

    const filteredLeads = leads.filter(lead =>
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className={styles.container}><div className={styles.loading}>Loading leads...</div></div>;
    }

    if (isError) {
        return <div className={styles.container}><div className={styles.error}>{error.message}</div></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Leads</h1>
                <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>
                    New Lead
                </button>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search by name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Email</th>
                            <th>Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id}>
                                <td>
                                    <Link to={`/leads/${lead.id}`} className={styles.leadLink}>
                                        {lead.first_name} {lead.last_name}
                                    </Link>
                                </td>
                                <td>{lead.company}</td>
                                <td><span className={`${styles.status} ${styles[`status${lead.status}`]}`}>{lead.status}</span></td>
                                <td>{lead.email || '-'}</td>
                                <td>{lead.owner_username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredLeads.length} of {leads.length} leads
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <NewLeadForm
                    onSubmit={createLeadMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createLeadMutation.isLoading}
                    error={createLeadMutation.error}
                />
            </Modal>
        </div>
    );
}
