import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Auth API with form-data support for OAuth2
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  adminLogin: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/admin/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (data: { email: string; password: string; name?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Accounts API
export const accountsApi = {
  getAll: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/accounts', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/accounts/${id}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (params?: {
    start_date?: string;
    end_date?: string;
    category_id?: number;
    account_id?: number;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/expenses/${id}`);
  },
};

// Loans API
export const loansApi = {
  getAll: async () => {
    const response = await api.get('/loans');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },
  
  getAmortization: async (id: number) => {
    const response = await api.get(`/loans/${id}/amortization`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/loans', data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/loans/${id}`);
  },
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: async () => {
    const response = await api.get('/subscriptions');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/subscriptions/${id}`);
  },
};

// Reports API
export const reportsApi = {
  getCalendar: async (year: number, month: number) => {
    const response = await api.get('/reports/calendar', {
      params: { year, month },
    });
    return response.data;
  },
  
  getSummary: async () => {
    const response = await api.get('/reports/summary');
    return response.data;
  },
  
  getByCategory: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/reports/by-category', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};

export default api;
