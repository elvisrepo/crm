import { useState, useEffect } from 'react';
import styles from './LineItemForm.module.css';

const LineItemForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading, 
    error, 
    products, 
    onNewProductClick,
    newlyCreatedProductId
}) => {
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: 1,
        sale_price: '',
    });
    const [selectedProductPrice, setSelectedProductPrice] = useState('');

    // Effect to auto-select a newly created product
    useEffect(() => {
        if (newlyCreatedProductId) {
            setFormData(prev => ({ ...prev, product_id: newlyCreatedProductId }));
        }
    }, [newlyCreatedProductId]);

    // Effect to update sale price when product changes
    useEffect(() => {
        if (formData.product_id) {
            const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
            if (selectedProduct) {
                const price = parseFloat(selectedProduct.standard_list_price).toFixed(2);
                setSelectedProductPrice(price);
                // Always update the sale_price to the new product's list price
                setFormData(prev => ({ ...prev, sale_price: price }));
            }
        } else {
            // Reset if no product is selected
            setSelectedProductPrice('');
            setFormData(prev => ({ ...prev, sale_price: '' }));
        }
    }, [formData.product_id, products]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Guard against submission if no product is selected
        if (!formData.product_id) {
            alert('Please select a product.');
            return;
        }
        const submissionData = {
            ...formData,
            quantity: parseInt(formData.quantity, 10),
            // Ensure sale_price is a string with 2 decimal places
            sale_price: parseFloat(formData.sale_price).toFixed(2),
        };
        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Add Product to Opportunity</h2>
            <div className={styles.formGroup}>
                <label htmlFor="product_id">Product*</label>
                <div className={styles.productSelector}>
                    <select
                        id="product_id"
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a Product</option>
                        {products?.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={onNewProductClick} className={styles.newProductButton}>
                        New
                    </button>
                </div>
                {selectedProductPrice && <small>List Price: ${selectedProductPrice}</small>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity*</label>
                <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="sale_price">Sale Price*</label>
                <input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={handleChange}
                    required
                />
            </div>

            {error && <div className={styles.errorMessage}>{error.message}</div>}

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default LineItemForm;
