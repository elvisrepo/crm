import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getOpportunity,
    deleteOpportunity,
    getProducts,
    createProduct,
    addLineItemToOpportunity,
    deleteLineItem,
    createOrderFromOpportunity
} from '../api/client';
import Modal from '../components/Modal';
import LineItemForm from '../components/LineItemForm';
import ProductForm from '../components/ProductForm';
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './OpportunityPage.module.css';

const OpportunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: currentUser } = useCurrentUser();
    const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
    const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);
    const [newlyCreatedProductId, setNewlyCreatedProductId] = useState(null);


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
            setAddProductModalOpen(false);
        },
    });

    // Mutation for creating a new product
    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: (newProduct) => {
            // Invalidate products to refetch the list with the new one
            queryClient.invalidateQueries(['products']).then(() => {
                // Once refetched, set the new product ID to auto-select it
                setNewlyCreatedProductId(newProduct.id);
                setNewProductModalOpen(false);
            });
        },
    });

    // Mutation for deleting a line item
    const deleteLineItemMutation = useMutation({
        mutationFn: deleteLineItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['opportunity', id]);
        },
    });

    const createOrderMutation = useMutation({
        mutationFn: () => createOrderFromOpportunity(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['orders']);
            navigate(`/orders/${data.id}`);
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

    // When the "Add Product" modal is closed, reset the newly created product ID
    const handleCloseAddProductModal = () => {
        setAddProductModalOpen(false);
        setNewlyCreatedProductId(null);
    }

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
                    {opportunity.stage === 'closed_won' && (
                        <button
                            onClick={() => createOrderMutation.mutate()}
                            className={styles.generateOrderButton}
                            disabled={createOrderMutation.isLoading}
                        >
                            {createOrderMutation.isLoading ? 'Generating Order...' : 'Generate Order'}
                        </button>
                    )}
                    <Link to={`/opportunities/${opportunity.id}/edit`} className={styles.editButton}>
                        Edit Opportunity
                    </Link>
                    <button onClick={handleDeleteOpportunity} className={styles.deleteButton} disabled={deleteOpportunityMutation.isLoading}>
                        {deleteOpportunityMutation.isLoading ? 'Deleting...' : 'Delete Opportunity'}
                    </button>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className={styles.threeColumnGrid}>
                {/* Column 1: About / Opportunity Details */}
                <div className={styles.column}>
                    <div className={styles.detailCard}>
                        <h2>About</h2>
                        <div className={styles.field}>
                            <label>Total Value</label>
                            <span className={styles.totalValue}>${totalValue.toFixed(2)}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Stage</label>
                            <span>{opportunity.stage}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Close Date</label>
                            <span>{opportunity.close_date || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <label>Owner</label>
                            <span>{opportunity.owner?.first_name} {opportunity.owner?.last_name || '-'}</span>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <h2>Related Account</h2>
                        <div className={styles.field}>
                            <label>Account</label>
                            <span>
                                {opportunity.account ? (
                                    <Link to={`/accounts/${opportunity.account.id}`}>
                                        {opportunity.account.name}
                                    </Link>
                                ) : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Activities */}
                <div className={styles.column}>
                    <div className={styles.activityCard}>
                        <h2>Activities</h2>
                        <ActivityQuickActions
                            entity={opportunity}
                            entityType="opportunity"
                            currentUser={currentUser}
                        />
                        <ActivityTimeline
                            entityType="opportunity"
                            entityId={parseInt(id)}
                        />
                    </div>
                </div>

                {/* Column 3: Products */}
                <div className={styles.column}>
                    <div className={styles.lineItemsCard}>
                        <div className={styles.cardHeader}>
                            <h2>Products</h2>
                            <button onClick={() => setAddProductModalOpen(true)} className={styles.addButton}>
                                Add Product
                            </button>
                        </div>
                        <table className={styles.lineItemsTable}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
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
                                        <td colSpan="5" className={styles.noItems}>No products added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for adding a line item */}
            <Modal isOpen={isAddProductModalOpen} onClose={handleCloseAddProductModal}>
                <LineItemForm
                    products={products}
                    onSubmit={addLineItemMutation.mutate}
                    onCancel={handleCloseAddProductModal}
                    isLoading={addLineItemMutation.isLoading}
                    error={addLineItemMutation.error}
                    onNewProductClick={() => setNewProductModalOpen(true)}
                    newlyCreatedProductId={newlyCreatedProductId}
                />
            </Modal>

            {/* Modal for creating a new product */}
            <Modal isOpen={isNewProductModalOpen} onClose={() => setNewProductModalOpen(false)}>
                <ProductForm
                    onSubmit={createProductMutation.mutate}
                    onCancel={() => setNewProductModalOpen(false)}
                    isLoading={createProductMutation.isLoading}
                    error={createProductMutation.error}
                />
            </Modal>


        </div>
    );
};

export default OpportunityPage;
