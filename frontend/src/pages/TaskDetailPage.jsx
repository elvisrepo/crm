import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivity, updateActivity, deleteActivity } from '../api/client';
import styles from './TaskDetailPage.module.css';

export default function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: task, isLoading, isError, error } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => getActivity(id)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['activity', id]);
            queryClient.invalidateQueries(['activities']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteActivity,
        onSuccess: () => {
            navigate('/activities/tasks');
        }
    });

    const handleStatusChange = (newStatus) => {
        updateMutation.mutate({
            id: task.id,
            data: { status: newStatus, version: task.version }
        });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteMutation.mutate({ id: task.id, version: task.version });
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading task...</div>
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
                <button onClick={() => navigate('/activities/tasks')} className={styles.backButton}>
                    ← Back to To-Do List
                </button>
                <div className={styles.actions}>
                    <button onClick={handleDelete} className={styles.deleteButton}>
                        Delete
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.mainSection}>
                    <h1 className={styles.subject}>{task.subject}</h1>

                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <label>Status</label>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={styles.statusSelect}
                                disabled={updateMutation.isPending}
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Waiting on someone else">Waiting on someone else</option>
                                <option value="Deferred">Deferred</option>
                            </select>
                        </div>

                        <div className={styles.detailItem}>
                            <label>Priority</label>
                            <span className={`${styles.priority} ${styles[`priority${task.priority}`]}`}>
                                {task.priority}
                            </span>
                        </div>

                        <div className={styles.detailItem}>
                            <label>Due Date</label>
                            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</span>
                        </div>

                        <div className={styles.detailItem}>
                            <label>Assigned To</label>
                            <span>{task.assigned_to_username || 'Unassigned'}</span>
                        </div>

                        {task.related_to_name && (
                            <div className={styles.detailItem}>
                                <label>Related To</label>
                                <span>{task.related_to_type}: {task.related_to_name}</span>
                            </div>
                        )}

                        {task.contact_names && task.contact_names.length > 0 && (
                            <div className={styles.detailItem}>
                                <label>Contacts</label>
                                <span>{task.contact_names.join(', ')}</span>
                            </div>
                        )}

                        {task.lead_names && task.lead_names.length > 0 && (
                            <div className={styles.detailItem}>
                                <label>Leads</label>
                                <span>{task.lead_names.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {task.comments && (
                        <div className={styles.commentsSection}>
                            <h3>Comments</h3>
                            <p className={styles.comments}>{task.comments}</p>
                        </div>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.infoBox}>
                        <h3>Task Information</h3>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Created</span>
                            <span>{new Date(task.created_at).toLocaleString()}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Last Modified</span>
                            <span>{new Date(task.updated_at).toLocaleString()}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Created By</span>
                            <span>{task.created_by_username}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
