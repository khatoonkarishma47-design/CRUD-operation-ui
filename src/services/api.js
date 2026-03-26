import axios from 'axios';

const API_BASE_URL = 'http://localhost:5034/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  register: async (username, password, email) => {
    const response = await api.post('/auth/register', { username, password, email });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product) => {
    const response = await api.post('/products', product);
    return response.data;
  },
  
  update: async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  exportToExcel: async () => {
    const response = await api.get('/products/export/excel', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Products.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportToPdf: async () => {
    const response = await api.get('/products/export/pdf', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Products.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const orderService = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default api;
