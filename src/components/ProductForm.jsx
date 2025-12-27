import { useState } from 'react';
import { productAPI } from '../services/api';

const ProductForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        product_type: '',
        salt_name: '',
        composition: '',
        manufacturer: '',
        consume_type: '',
        composition_code: '',
        schedule_category: '',
        marketed_by: '',
        used_for: '',
        expiry: '',
        manufacture_date: '',
        quantity_available: '',
        product_pricing_old: '',
        product_pricing_new: '',
        visibility_status: 'Active',
        categories: '',
        prescription_required: 'No',
        rc: 0,
        medicine_href: '',
        meta_keywords: '',
        meta_title: '',
        meta_description: '',
        product_name_url: '',
        formulation: ''
    });

    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert('Product name is required');
            return;
        }

        try {
            setLoading(true);
            const response = await productAPI.createProduct(formData);

            if (response.success) {
                alert('Product created successfully!');
                setFormData({
                    name: '',
                    product_type: '',
                    salt_name: '',
                    composition: '',
                    manufacturer: '',
                    consume_type: '',
                    composition_code: '',
                    schedule_category: '',
                    marketed_by: '',
                    used_for: '',
                    expiry: '',
                    manufacture_date: '',
                    quantity_available: '',
                    product_pricing_old: '',
                    product_pricing_new: '',
                    visibility_status: 'Active',
                    categories: '',
                    prescription_required: 'No',
                    rc: 0,
                    medicine_href: '',
                    meta_keywords: '',
                    meta_title: '',
                    meta_description: '',
                    product_name_url: '',
                    formulation: ''
                });
                setShowForm(false);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <button
                onClick={() => setShowForm(!showForm)}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}
            >
                {showForm ? 'Hide Form' : '+ Add New Product'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Product</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Product Type
                            </label>
                            <input
                                type="text"
                                name="product_type"
                                value={formData.product_type}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Salt Name
                            </label>
                            <input
                                type="text"
                                name="salt_name"
                                value={formData.salt_name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Manufacturer
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Composition
                            </label>
                            <input
                                type="text"
                                name="composition"
                                value={formData.composition}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Consume Type
                            </label>
                            <input
                                type="text"
                                name="consume_type"
                                value={formData.consume_type}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Old Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="product_pricing_old"
                                value={formData.product_pricing_old}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                New Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="product_pricing_new"
                                value={formData.product_pricing_new}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Quantity Available
                            </label>
                            <input
                                type="number"
                                name="quantity_available"
                                value={formData.quantity_available}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Manufacture Date
                            </label>
                            <input
                                type="date"
                                name="manufacture_date"
                                value={formData.manufacture_date}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiry"
                                value={formData.expiry}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Categories
                            </label>
                            <input
                                type="text"
                                name="categories"
                                value={formData.categories}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Visibility Status
                            </label>
                            <select
                                name="visibility_status"
                                value={formData.visibility_status}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Prescription Required
                            </label>
                            <select
                                name="prescription_required"
                                value={formData.prescription_required}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Formulation
                            </label>
                            <input
                                type="text"
                                name="formulation"
                                value={formData.formulation}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: loading ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductForm;
