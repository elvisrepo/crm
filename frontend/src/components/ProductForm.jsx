import { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

const ProductForm = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        standard_list_price: '0.00',
        is_retainer_product: false,
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                standard_list_price: initialData.standard_list_price || '0.00',
                is_retainer_product: initialData.is_retainer_product || false,
            });
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submittedData = {
            ...formData,
            standard_list_price: parseFloat(formData.standard_list_price).toFixed(2),
        };
        onSubmit(submittedData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{isEditMode ? 'Edit Product' : 'New Product'}</h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">Product Name*</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="standard_list_price">List Price*</label>
                <input
                    id="standard_list_price"
                    name="standard_list_price"
                    type="number"
                    step="0.01"
                    value={formData.standard_list_price}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className={styles.formGroup}>
                <label>
                    <input
                        name="is_retainer_product"
                        type="checkbox"
                        checked={formData.is_retainer_product}
                        onChange={handleChange}
                    />
                    Is this a retainer product?
                </label>
            </div>
            {error && <div className={styles.errorMessage}>{error.message}</div>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Product')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
