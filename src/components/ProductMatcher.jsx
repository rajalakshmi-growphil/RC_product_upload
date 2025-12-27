import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { productAPI } from '../services/api';
import './ProductMatcher.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const ProductMatcher = () => {
    const [file, setFile] = useState(null);
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [matchSearchTerm, setMatchSearchTerm] = useState('');
    const [matchResults, setMatchResults] = useState([]);
    const [searchingMatches, setSearchingMatches] = useState(false);
    const gridRef = useRef();

    const columnDefs = useMemo(() => [
        {
            headerName: '#',
            valueGetter: "node.rowIndex + 1",
            width: 60,
            pinned: 'left'
        },
        { field: 'brand_name', headerName: 'New Brand Name', width: 220, pinned: 'left', filter: true },
        { field: 'matched_name', headerName: 'Matched Brand / RC Name', width: 220, cellStyle: { color: '#28a745' } },
        { field: 'product_id', headerName: 'Old DB ID', width: 100, cellStyle: { color: '#6c757d' } },

        { field: 'generic_name', headerName: 'New Generic Name', width: 220, filter: true },
        { field: 'matched_composition', headerName: 'Old DB Composition', width: 220, cellStyle: { color: '#28a745' } },

        {
            field: 'stock_status',
            headerName: 'Old Stock',
            width: 120,
            cellStyle: params => params.value === 'In Stock' ? { color: 'green', fontWeight: 'bold' } : { color: 'red' }
        },

        { field: 'sheet_name', headerName: 'Sheet', width: 120, filter: true },
        { field: 'manufacturer', headerName: 'Manufacturer', width: 150, filter: true },
        { field: 'packing', headerName: 'Packing', width: 100 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            cellRenderer: params => {
                switch (params.value) {
                    case 'Pending': return <span className="status-pending">⏳ Pending</span>;
                    case 'Processing': return <span className="status-processing">🔄 Processing...</span>;
                    case 'Matched': return <span className="status-matched">✅ Matched & Linked</span>;
                    case 'Created': return <span className="status-created">➕ New Created</span>;
                    case 'Not Found': return <span className="status-not-found">⚠️ Not Found</span>;
                    case 'Error': return <span className="status-error">❌ Error</span>;
                    default: return params.value;
                }
            },
        },
        {
            headerName: 'Action',
            width: 120,
            pinned: 'right',
            cellRenderer: params => (
                <button
                    className={`btn-match-action ${params.data.status === 'Matched' ? 'btn-matched' : ''}`}
                    onClick={() => handleOpenMatchModal(params.data)}
                >
                    {params.data.status === 'Matched' ? '✅ Re-match' : '🔍 Match'}
                </button>
            )
        },
        { field: 'details', headerName: 'Details', width: 220 }
    ], []);

    const getRowStyle = params => {
        if (params.data.status === 'Matched' || params.data.status === 'Created') {
            return { background: 'rgba(40, 167, 69, 0.1)' };
        }
        return null;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                let allProducts = [];
                let idCounter = 0;

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const sheetProducts = jsonData.map((row) => ({
                        id: idCounter++,
                        brand_name: row['BRAND NAME'] || row['Brand Name'] || '',
                        generic_name: row['GENERIC NAME'] || row['Generic Name'] || '',
                        manufacturer: row['MANUFACTURER'] || row['Manufacturer'] || '',
                        packing: row['PACKING'] || row['Packing'] || '',
                        sheet_name: sheetName,
                        matched_name: '',
                        matched_composition: '',
                        stock_status: '',
                        status: 'Pending',
                        details: ''
                    })).filter(p => p.brand_name);

                    allProducts = [...allProducts, ...sheetProducts];
                });

                if (allProducts.length === 0) {
                    alert('No valid products found in any sheet. Please check column headers.');
                } else {
                    setRowData(allProducts);
                    // Automatically detect matches after loading data
                    handleAutoDetectMatches(allProducts);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error reading file');
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAutoDetectMatches = async (products) => {
        try {
            setProcessing(true);
            const response = await productAPI.matchStock(products);
            if (response.success && response.matched_products) {
                // Create a map for faster lookup
                const matchMap = new Map();
                response.matched_products.forEach(m => {
                    const key = `${m.matched_brand.toLowerCase()}|${m.matched_generic.toLowerCase()}`;
                    matchMap.set(key, m);
                });

                // Update rowData state directly
                setRowData(prevData => {
                    return prevData.map(row => {
                        const rowKey = `${row.brand_name.toLowerCase()}|${row.generic_name.toLowerCase()}`;
                        const match = matchMap.get(rowKey);

                        if (match) {
                            return {
                                ...row,
                                status: 'Matched',
                                details: `Auto-Detected: ${match.rc_pharam_product_name || '(No RC Name)'}`,
                                matched_name: match.rc_pharam_product_name || match.name,
                                matched_composition: match.composition,
                                stock_status: match.inStock ? 'In Stock' : 'Out of Stock',
                                product_id: match.product_id
                            };
                        }
                        return row;
                    });
                });
            }
        } catch (error) {
            console.error('Auto-detection failed:', error);
        } finally {
            setProcessing(false);
        }
    };


    const handleOpenMatchModal = (product) => {
        setSelectedProduct(product);
        setMatchSearchTerm(product.brand_name);
        setMatchResults([]);
        handleSearchMatches(product.brand_name, product.generic_name, product.brand_name);
    };

    const handleSearchMatches = async (term, generic, excelBrand) => {
        setSearchingMatches(true);
        try {
            const response = await productAPI.findMatches(term, generic, excelBrand);
            if (response.success) {
                setMatchResults(response.data);
            }
        } catch (error) {
            console.error('Match search failed:', error);
        } finally {
            setSearchingMatches(false);
        }
    };

    const handleSaveMatch = async (dbProduct, rcName) => {
        if (!selectedProduct) return;

        try {
            setProcessing(true);
            const response = await productAPI.approveMatch(
                dbProduct.product_id,
                rcName,
                selectedProduct.brand_name,
                selectedProduct.generic_name,
                selectedProduct.manufacturer,
                selectedProduct.packing
            );

            if (response.success) {
                updateRowStatus(selectedProduct.id, {
                    status: 'Matched',
                    details: `Saved: ${rcName}`,
                    matched_name: dbProduct.rc_pharam_product_name || dbProduct.name,
                    matched_composition: dbProduct.composition,
                    stock_status: 'In Stock',
                    product_id: dbProduct.product_id
                });
                setSelectedProduct(null);
            }
        } catch (error) {
            alert('Failed to save match: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const updateRowStatus = (id, updates) => {
        if (gridRef.current && gridRef.current.api) {
            const rowNode = gridRef.current.api.getRowNode(id);
            if (rowNode) {
                // Update the underlying data object
                const newData = { ...rowNode.data, ...updates };
                rowNode.setData(newData);
            }
        }
    };


    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true
    }), []);

    const [activeTab, setActiveTab] = useState('all');

    const getFilteredRowData = useCallback(() => {
        if (!rowData) return [];
        switch (activeTab) {
            case 'matched':
                return rowData.filter(row => row.status === 'Matched');
            case 'created':
                return rowData.filter(row => row.status === 'Created');
            case 'outOfStock':
                return rowData.filter(row => row.status === 'Matched' && row.stock_status === 'Out of Stock');
            default:
                return rowData;
        }
    }, [rowData, activeTab]);

    return (
        <div className="product-matcher-container">
            <div className="matcher-header">
                <h2>Product Matching Tool - Bulk Processing</h2>

                {rowData.length > 0 && (
                    <div className="matcher-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            📋 All ({rowData.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'matched' ? 'active' : ''}`}
                            onClick={() => setActiveTab('matched')}
                        >
                            ✅ Matched ({rowData.filter(r => r.status === 'Matched').length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
                            onClick={() => setActiveTab('created')}
                        >
                            ➕ New Created ({rowData.filter(r => r.status === 'Created').length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'outOfStock' ? 'active' : ''}`}
                            onClick={() => setActiveTab('outOfStock')}
                        >
                            ⚠️ Matched (No Stock) ({rowData.filter(r => r.status === 'Matched' && r.stock_status === 'Out of Stock').length})
                        </button>
                    </div>
                )}
            </div>

            <div className="matcher-controls">
                <div className="upload-controls">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        id="file-upload-grid"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload-grid" className="btn-upload">
                        {file ? `📄 ${file.name}` : '📁 Select Excel File'}
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="btn-primary"
                    >
                        {loading ? 'Loading...' : 'Load Data'}
                    </button>

                    {rowData.length > 0 && (
                        <div className="matcher-stats">
                            <span>Total: {rowData.length}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="ag-theme-alpine matcher-grid" style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    getRowId={params => params.data.id}
                    rowData={getFilteredRowData()}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 30, 40, 50, 100]}
                    animateRows={true}
                />
            </div>

            {selectedProduct && (
                <div className="match-modal-overlay">
                    <div className="match-modal">
                        <div className="modal-header">
                            <h3>🔍 Match Product</h3>
                            <button className="btn-close" onClick={() => setSelectedProduct(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="selected-product-info">
                                <p><strong>New Brand:</strong> {selectedProduct.brand_name}</p>
                                <p><strong>New Generic:</strong> {selectedProduct.generic_name}</p>
                            </div>

                            <div className="match-search-box">
                                <input
                                    type="text"
                                    value={matchSearchTerm}
                                    onChange={(e) => setMatchSearchTerm(e.target.value)}
                                    placeholder="Search RC Product Name..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchMatches(matchSearchTerm, selectedProduct.generic_name, selectedProduct.brand_name)}
                                />
                                <button
                                    className="btn-search"
                                    onClick={() => handleSearchMatches(matchSearchTerm, selectedProduct.generic_name, selectedProduct.brand_name)}
                                    disabled={searchingMatches}
                                >
                                    {searchingMatches ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            <div className="match-results-list">
                                {matchResults.length > 0 ? (
                                    matchResults.map(res => (
                                        <div key={res.product_id} className={`match-result-item rank-${res.match_score}`}>
                                            <div className="result-info">
                                                <div className="result-main">
                                                    <span className="result-name">{res.rc_pharam_product_name || res.name}</span>
                                                    <span className="match-badge">
                                                        {res.match_type}
                                                    </span>
                                                </div>
                                                <div className="result-sub">
                                                    <p><strong>Product ID:</strong> {res.product_id}</p>
                                                    <p><strong>Composition:</strong> {res.composition}</p>
                                                    {res.salt_name && <p><strong>Salt:</strong> {res.salt_name}</p>}
                                                    <p><strong>Stock:</strong> <span className={res.inStock ? 'status-in-stock' : 'status-out-of-stock'}>
                                                        {res.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                                                    </span></p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-add-rc"
                                                onClick={() => handleSaveMatch(res, res.rc_pharam_product_name || selectedProduct.brand_name)}
                                            >
                                                Add RC Product Name
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-results">{searchingMatches ? 'Finding matches...' : 'No matches found. Try changing search term.'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMatcher;
