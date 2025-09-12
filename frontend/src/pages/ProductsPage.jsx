import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct } from '../api/client';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import styles from './OpportunitiesPage.module.css'; // Reusing styles

const ProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: products = [], isLoading, isError, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
        },
    });

    const filteredProducts = products.filter(prod =>
        prod.is_active && prod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className={styles.container}><div className={styles.loading}>Loading products...</div></div>;
    }

    if (isError) {
        return <div className={styles.container}><div className={styles.error}>{error.message}</div></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Products</h1>
                <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>
                    New Product
                </button>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>List Price</th>
                            <th>Retainer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((prod) => (
                            <tr key={prod.id}>
                                <td>
                                    <Link to={`/products/${prod.id}`} className={styles.accountLink}>
                                        {prod.name}
                                    </Link>
                                </td>
                                <td>${parseFloat(prod.standard_list_price).toFixed(2)}</td>
                                <td>{prod.is_retainer_product ? 'Yes' : 'No'}</td>
                                <td>
                                    <Link to={`/products/${prod.id}/edit`} className={styles.editButton}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredProducts.length} of {products.length} products
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProductForm
                    onSubmit={createProductMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createProductMutation.isLoading}
                    error={createProductMutation.error}
                />
            </Modal>
        </div>
    );
};

export default ProductsPage;
