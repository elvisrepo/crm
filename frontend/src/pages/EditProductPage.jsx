import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, updateProduct, deleteProduct } from '../api/client';
import ProductForm from '../components/ProductForm';
import styles from './AccountsPage.module.css'; // Reusing styles

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id),
    });

    const updateProductMutation = useMutation({
        mutationFn: (productData) => updateProduct(id, productData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            navigate('/products');
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (version) => deleteProduct({ id, version }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/products');
        },
    });

    const handleSubmit = (formData) => {
        updateProductMutation.mutate({ ...formData, version: product.version });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProductMutation.mutate(product.version);
        }
    };

    const handleCancel = () => {
        navigate('/products');
    };

    if (isLoading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateProductMutation.isLoading}
                    error={updateProductMutation.error}
                />
                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button onClick={handleDelete} className={`${styles.button} ${styles.deleteButton}`} disabled={deleteProductMutation.isLoading}>
                        {deleteProductMutation.isLoading ? 'Deleting...' : 'Delete Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
