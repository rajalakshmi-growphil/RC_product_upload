import { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { productAPI } from '../services/api';

const ProductGrid = () => {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [compositionSearch, setCompositionSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAllProducts();
            if (response.success) {
                setRowData(response.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const onCellValueChanged = useCallback(async (params) => {
        try {
            const updatedData = { [params.colDef.field]: params.newValue };
            await productAPI.updateProduct(params.data.product_id, updatedData);
            console.log('Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
            params.node.setDataValue(params.colDef.field, params.oldValue);
        }
    }, []);

    const handleUnmatch = useCallback(async (productId) => {
        if (!window.confirm('Are you sure you want to remove this match?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await productAPI.unmatchProduct(productId);
            if (response.success) {
                await loadProducts();
                alert('Match removed successfully');
            } else {
                alert('Failed to remove match: ' + response.error);
            }
        } catch (error) {
            console.error('Error removing match:', error);
            alert('Error removing match');
        } finally {
            setLoading(false);
        }
    }, [loadProducts]);

    const handleDelete = useCallback(async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await productAPI.deleteProduct(productId);
            loadProducts();
            alert('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    }, [loadProducts]);

    const columnDefs = useMemo(() => [
        {
            field: 'product_id',
            headerName: 'ID',
            width: 80,
            pinned: 'left',
            editable: false,
            filter: 'agNumberColumnFilter'
        },
        {
            field: 'name',
            headerName: 'Product Name',
            width: 250,
            pinned: 'left',
            editable: true,
            filter: 'agTextColumnFilter'
        },
        {
            field: 'rc_pharam_product_name',
            headerName: 'RC Pharam Product Name',
            width: 250,
            pinned: 'left',
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: params => {
                return params.value ? { backgroundColor: '#d4edda', fontWeight: '500' } : null;
            }
        },
        {
            field: 'inStock',
            headerName: 'In Stock',
            width: 120,
            pinned: 'left',
            editable: false,
            filter: 'agSetColumnFilter',
            cellRenderer: params => {
                return params.value ? '✓ Yes' : '✗ No';
            },
            cellStyle: params => {
                return params.value
                    ? { backgroundColor: '#d4edda', color: '#28a745', fontWeight: 'bold' }
                    : { backgroundColor: '#f8d7da', color: '#dc3545' };
            }
        },
        { field: 'product_type', headerName: 'Type', width: 150, editable: true },
        { field: 'salt_name', headerName: 'Salt Name', width: 200, editable: true },
        { field: 'composition', headerName: 'Composition', width: 200, editable: true },
        { field: 'manufacturer', headerName: 'Manufacturer', width: 200, editable: true },
        { field: 'consume_type', headerName: 'Consume Type', width: 150, editable: true },
        { field: 'composition_code', headerName: 'Composition Code', width: 180, editable: true },
        { field: 'schedule_category', headerName: 'Schedule Category', width: 180, editable: true },
        { field: 'marketed_by', headerName: 'Marketed By', width: 200, editable: true },
        { field: 'used_for', headerName: 'Used For', width: 250, editable: true },
        { field: 'expiry', headerName: 'Expiry Date', width: 150, editable: true, filter: 'agDateColumnFilter' },
        { field: 'manufacture_date', headerName: 'Manufacture Date', width: 150, editable: true, filter: 'agDateColumnFilter' },
        { field: 'quantity_available', headerName: 'Quantity', width: 120, editable: true, filter: 'agNumberColumnFilter' },
        { field: 'rack_id', headerName: 'Rack ID', width: 120, editable: true },
        { field: 'department_id', headerName: 'Department ID', width: 140, editable: true },
        { field: 'product_pricing_old', headerName: 'Old Price', width: 120, editable: true, filter: 'agNumberColumnFilter', valueFormatter: params => params.value ? `₹${params.value}` : '' },
        { field: 'product_pricing_new', headerName: 'New Price', width: 120, editable: true, filter: 'agNumberColumnFilter', valueFormatter: params => params.value ? `₹${params.value}` : '' },
        { field: 'product_coupon_code', headerName: 'Coupon Code', width: 150, editable: true },
        { field: 'visibility_status', headerName: 'Visibility', width: 130, editable: true },
        { field: 'variant', headerName: 'Variant', width: 130, editable: true },
        { field: 'tags', headerName: 'Tags', width: 200, editable: true },
        { field: 'categories', headerName: 'Categories', width: 200, editable: true },
        { field: 'inventory_info_sku', headerName: 'SKU', width: 150, editable: true },
        { field: 'inventory_info_total_stock', headerName: 'Total Stock', width: 130, editable: true, filter: 'agNumberColumnFilter' },
        { field: 'inventory_info_supplier_id', headerName: 'Supplier ID', width: 130, editable: true },
        { field: 'page_title', headerName: 'Page Title', width: 200, editable: true },
        { field: 'product_url_id', headerName: 'URL ID', width: 150, editable: true },
        { field: 'prescription_required', headerName: 'Prescription', width: 140, editable: true },
        { field: 'reward_points_mig_coins', headerName: 'Reward Points', width: 140, editable: true },
        { field: 'publish_date', headerName: 'Publish Date', width: 150, editable: true },
        { field: 'publish_time', headerName: 'Publish Time', width: 130, editable: true },
        { field: 'created_by', headerName: 'Created By', width: 150, editable: true },
        { field: 'packaging', headerName: 'Packaging', width: 150, editable: true },
        { field: 'rc', headerName: 'RC', width: 100, editable: true },
        { field: 'formulation', headerName: 'Formulation', width: 200, editable: true },
        { field: 'long_description', headerName: 'Description', width: 300, editable: true },
        { field: 'photo', headerName: 'Photo URL', width: 200, editable: true },
        { field: 'images', headerName: 'Images', width: 200, editable: true },
        { field: 'faq', headerName: 'FAQ', width: 200, editable: true },
        { field: 'available_for_states', headerName: 'Available States', width: 200, editable: true },
        { field: 'selected_category', headerName: 'Selected Category', width: 180, editable: true },
        { field: 'medicine_href', headerName: 'Medicine Link', width: 200, editable: true },
        { field: 'meta_keywords', headerName: 'Meta Keywords', width: 200, editable: true },
        { field: 'meta_title', headerName: 'Meta Title', width: 200, editable: true },
        { field: 'meta_description', headerName: 'Meta Description', width: 250, editable: true },
        { field: 'product_name_url', headerName: 'Product URL', width: 200, editable: true },
        { field: 'related_product_ids', headerName: 'Related Products', width: 180, editable: true },
        { field: 'product_entry_created_date', headerName: 'Created Date', width: 180, editable: false },
        { field: 'product_entry_updated_date', headerName: 'Updated Date', width: 180, editable: false },
        {
            headerName: 'Actions',
            width: 180,
            pinned: 'right',
            cellRenderer: (params) => {
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => handleDelete(params.data.product_id)}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Delete
                        </button>
                        {params.data.rc_pharam_product_name && (
                            <button
                                onClick={() => handleUnmatch(params.data.product_id)}
                                style={{
                                    backgroundColor: '#ffc107',
                                    color: '#212529',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Remove Match
                            </button>
                        )}
                    </div>
                );
            }
        }
    ], [handleDelete, handleUnmatch]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
    }), []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadProducts();
            return;
        }

        try {
            setLoading(true);
            const response = await productAPI.searchProducts(searchTerm);
            if (response.success) {
                setRowData(response.data);
            }
        } catch (error) {
            console.error('Error searching products:', error);
            alert('Failed to search products');
        } finally {
            setLoading(false);
        }
    };

    const handleCompositionSearch = async () => {
        if (!compositionSearch.trim()) {
            loadProducts();
            return;
        }

        try {
            setLoading(true);
            const response = await productAPI.searchProducts(compositionSearch);
            if (response.success) {
                setRowData(response.data);
            }
        } catch (error) {
            console.error('Error searching by composition:', error);
            alert('Failed to search by composition');
        } finally {
            setLoading(false);
        }
    };

    const filteredRowData = useMemo(() => {
        if (!rowData) return [];
        switch (activeTab) {
            case 'inStock':
                return rowData.filter(row => row.inStock === 1 || row.inStock === true);
            case 'outOfStock':
                return rowData.filter(row => row.inStock === 0 || row.inStock === false || row.inStock === null);
            case 'newData':
                return rowData.filter(row => {
                    const hasCore = row.name && (row.composition || row.salt_name) && row.rc_pharam_product_name;
                    const isInStock = row.inStock === 1 || row.inStock === true;
                    const isMinimal =
                        (!row.manufacturer || row.manufacturer === 'nan' || row.manufacturer === '') &&
                        (!row.packaging || row.packaging === 'nan' || row.packaging === '') &&
                        (!row.long_description || row.long_description === '' || row.long_description === 'nan') &&
                        (!row.product_pricing_new || row.product_pricing_new === 0);

                    return hasCore && isInStock && isMinimal;
                });
            default:
                return rowData;
        }
    }, [rowData, activeTab]);

    const tabButtonStyle = (tabName) => ({
        padding: '10px 20px',
        backgroundColor: activeTab === tabName ? '#007bff' : '#f8f9fa',
        color: activeTab === tabName ? 'white' : '#333',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: activeTab === tabName ? 'bold' : 'normal',
        transition: 'all 0.2s'
    });

    const handleExport = async () => {
        try {
            const blob = await productAPI.exportToExcel();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={tabButtonStyle('all')}
                >
                    📋 All Products ({rowData.length})
                </button>
                <button
                    onClick={() => setActiveTab('inStock')}
                    style={tabButtonStyle('inStock')}
                >
                    ✅ In Stock ({rowData.filter(r => r.inStock === 1 || r.inStock === true).length})
                </button>
                <button
                    onClick={() => setActiveTab('outOfStock')}
                    style={tabButtonStyle('outOfStock')}
                >
                    ❌ Out of Stock ({rowData.filter(r => r.inStock === 0 || r.inStock === false || r.inStock === null).length})
                </button>
                <button
                    onClick={() => setActiveTab('newData')}
                    style={tabButtonStyle('newData')}
                >
                    🆕 New Data ({rowData.filter(row => {
                        const hasCore = row.name && (row.composition || row.salt_name) && row.rc_pharam_product_name;
                        const isInStock = row.inStock === 1 || row.inStock === true;
                        const isMinimal =
                            (!row.manufacturer || row.manufacturer === 'nan' || row.manufacturer === '') &&
                            (!row.packaging || row.packaging === 'nan' || row.packaging === '') &&
                            (!row.long_description || row.long_description === '' || row.long_description === 'nan') &&
                            (!row.product_pricing_new || row.product_pricing_new === 0);
                        return hasCore && isInStock && isMinimal;
                    }).length})
                </button>
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '300px'
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Search
                </button>
                <button
                    onClick={loadProducts}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Refresh
                </button>
                <div style={{
                    borderLeft: '2px solid #ddd',
                    height: '40px',
                    margin: '0 10px'
                }} />
                <input
                    type="text"
                    placeholder="Search by composition..."
                    value={compositionSearch}
                    onChange={(e) => setCompositionSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCompositionSearch()}
                    style={{
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '250px'
                    }}
                />
                <button
                    onClick={handleCompositionSearch}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔍 Search Composition
                </button>
                <button
                    onClick={handleExport}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Export to Excel
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
            ) : (
                <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                    <AgGridReact
                        rowData={filteredRowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onCellValueChanged={onCellValueChanged}
                        pagination={true}
                        paginationPageSize={50}
                        paginationPageSizeSelector={[20, 50, 100, 200]}
                        enableCellTextSelection={true}
                        ensureDomOrder={true}
                        animateRows={true}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
