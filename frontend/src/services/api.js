import axios from 'axios';
//base
const API_BASE_URL = "https://inventory-management-yexl.onrender.com/api";
// const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendors API using
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
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getBarcodeImage: (barcode) => api.get(`/barcode/${barcode}/barcode-image`, {
    responseType: 'blob'
  }),
  filterByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (data) => {
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' && data[key]) {
        formData.append('photo', data[key]);
      } else if (key !== 'photo') {
        formData.append(key, data[key]);
      }
    });
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => {
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' && data[key]) {
        formData.append('photo', data[key]);
      } else if (key !== 'photo') {
        formData.append(key, data[key]);
      }
    });
    
    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
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
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  scanBarcode: (data) => api.post('/sales/scan', data),
  getInvoice: (id) => api.get(`/sales/${id}/invoice`, { responseType: 'blob' }),
};

// Barcodes API
export const barcodesAPI = {
  getByBarcode: (barcode) => api.get(`/barcodes/${barcode}`),
  generate: (productItemId) => api.get(`/barcodes/product-item/${productItemId}`),
};

export default api;