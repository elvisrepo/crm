import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getOpportunity,
    deleteOpportunity,
    getProducts,
    addLineItemToOpportunity,
    deleteLineItem
} from '../api/client';
import Modal from '../components/Modal';
import LineItemForm from '../components/LineItemForm';
import styles from './OpportunityPage.module.css';

const OpportunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch the opportunity details
    const { data: opportunity, isLoading, isError, error } = useQuery({
        queryKey: ['opportunity', id],
        queryFn: () => getOpportunity(id),
    });

    // Fetch the list of all products for the modal form
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    // Mutation for deleting the entire opportunity
    const deleteOpportunityMutation = useMutation({
        mutationFn: deleteOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunities']);
            navigate('/opportunities');
        },
    });

    // Mutation for adding a new line item
    const addLineItemMutation = useMutation({
        mutationFn: (lineItemData) => addLineItemToOpportunity(id, lineItemData),
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunity', id]);
            setIsModalOpen(false);
        },
    });

    // Mutation for deleting a line item
    const deleteLineItemMutation = useMutation({
        mutationFn: deleteLineItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunity', id]);
        },
    });

    const handleDeleteOpportunity = () => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            deleteOpportunityMutation.mutate({ id: opportunity.id, version: opportunity.version });
        }
    };

    const handleDeleteLineItem = (lineItem) => {
        if (window.confirm(`Are you sure you want to remove product "${lineItem.product.name}"?`)) {
            deleteLineItemMutation.mutate({
                opportunityId: id,
                lineItemId: lineItem.id,
                version: lineItem.version
            });
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

    const totalValue = opportunity.line_items?.reduce((acc, item) => {
        return acc + (parseFloat(item.sale_price) * item.quantity);
    }, 0) || 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{opportunity.name}</h1>
                <div className={styles.actions}>
                    <Link to={`/opportunities/${opportunity.id}/edit`} className={styles.editButton}>
                        Edit Opportunity
                    </Link>
                    <button onClick={handleDeleteOpportunity} className={styles.deleteButton} disabled={deleteOpportunityMutation.isLoading}>
                        {deleteOpportunityMutation.isLoading ? 'Deleting...' : 'Delete Opportunity'}
                    </button>
                </div>
            </div>

            {/* Opportunity Details Card */}
            <div className={styles.detailCard}>
                 <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Total Value:</span>
                    <span className={`${styles.detailValue} ${styles.totalValue}`}>${totalValue.toFixed(2)}</span>
                </div>
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
                    <span className={styles.detailLabel}>Owner:</span>
                    <span className={styles.detailValue}>{opportunity.owner?.first_name} {opportunity.owner?.last_name || '-'}</span>
                </div>
            </div>

            {/* Line Items Card */}
            <div className={styles.lineItemsCard}>
                <div className={styles.cardHeader}>
                    <h2>Products</h2>
                    <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
                        Add Product
                    </button>
                </div>
                <table className={styles.lineItemsTable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Sale Price</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {opportunity.line_items?.length > 0 ? (
                            opportunity.line_items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${parseFloat(item.sale_price).toFixed(2)}</td>
                                    <td>${(item.quantity * parseFloat(item.sale_price)).toFixed(2)}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteLineItem(item)}
                                            className={styles.deleteItemButton}
                                            disabled={deleteLineItemMutation.isLoading}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.noItems}>No products have been added to this opportunity yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <LineItemForm
                    products={products}
                    onSubmit={addLineItemMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={addLineItemMutation.isLoading}
                    error={addLineItemMutation.error}
                />
            </Modal>
        </div>
    );
};

export default OpportunityPage;