import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getProduct, deleteProduct } from "../api/client";
import styles from './ProductPage.module.css';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id),
    });

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/products');
        },
        onError: (error) => {
            alert(`Failed to delete product: ${error.message || 'An unexpected error occurred.'}`);
        },
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete product "${product?.name}"?`)) {
            deleteProductMutation.mutate({ id: product.id, version: product.version });
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading product...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{product?.name}</h1>
                <div className={styles.actions}>
                    <Link to={`/products/${id}/edit`} className={`${styles.editButton} ${styles.button}`}>Edit</Link>
                    <button
                        onClick={handleDelete}
                        className={`${styles.deleteButton} ${styles.button}`}
                        disabled={deleteProductMutation.isLoading}
                    >
                        {deleteProductMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                    <h2>Product Details</h2>
                    <div className={styles.field}>
                        <label>Description</label>
                        <span className={styles.description}>{product?.description || '-'}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Standard List Price</label>
                        <span>${parseFloat(product?.standard_list_price).toFixed(2) || '-'}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Retainer Product</label>
                        <span>{product?.is_retainer_product ? 'Yes' : 'No'}</span>
                    </div>
                     <div className={styles.field}>
                        <label>Owner</label>
                        <span>{product?.owner_username} </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
              