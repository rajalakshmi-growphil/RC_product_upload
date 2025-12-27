import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const productAPI = {
    getAllProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    searchProducts: async (searchTerm) => {
        const response = await api.get(`/products/search?q=${searchTerm}`);
        return response.data;
    },

    exportToExcel: async () => {
        const response = await api.get('/products/export', {
            responseType: 'blob',
        });
        return response.data;
    },

    uploadExcel: async (formData) => {
        const response = await axios.post(`${API_BASE_URL}/products/upload-excel`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    findMatches: async (productName, genericName = '', excelBrandName = '') => {
        const response = await api.post('/products/find-matches', {
            product_name: productName,
            generic_name: genericName,
            excel_brand_name: excelBrandName,
        });
        return response.data;
    },

    approveMatch: async (productId, rcProductName, brandName = '', genericName = '', manufacturer = '', packing = '') => {
        const response = await api.post('/products/approve-match', {
            product_id: productId,
            rc_product_name: rcProductName,
            brand_name: brandName,
            generic_name: genericName,
            manufacturer: manufacturer,
            packing: packing
        });
        return response.data;
    },

    matchStock: async (products) => {
        const response = await api.post('/products/match-stock', {
            products: products,
        });
        return response.data;
    },
    unmatchProduct: async (productId) => {
        const response = await api.post('/products/unmatch', {
            product_id: productId,
        });
        return response.data;
    },
};

export default api;
