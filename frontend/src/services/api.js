import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-yexl.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendors API
export const vendorsAPI = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Buyers API
export const buyersAPI = {
  getAll: () => api.get('/buyers'),
  getById: (id) => api.get(`/buyers/${id}`),
  create: (data) => api.post('/buyers', data),
  update: (id, data) => api.put(`/buyers/${id}`, data),
  delete: (id) => api.delete(`/buyers/${id}`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getLowStock: () => api.get('/products/low-stock'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Purchases API
export const purchasesAPI = {
  getAll: () => api.get('/purchases'),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  getBarcodes: (id) => api.get(`/purchases/${id}/barcodes`),
  getInvoice: (id) => api.get(`/purchases/${id}/invoice`, { responseType: 'blob' }),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  scanBarcode: (data) => api.post('/sales/scan', data),
  getInvoice: (id) => api.get(`/sales/${id}/invoice`, { responseType: 'blob' }),
};

// Barcodes API
export const barcodesAPI = {
  getByBarcode: (barcode) => api.get(`/barcodes/${barcode}`),
  generate: (productItemId) => api.get(`/barcodes/product-item/${productItemId}`),
};

export default api;