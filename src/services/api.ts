import axios from 'axios';

// Tu base URL sigue intacta
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Response interceptor to handle session expiration or unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user_session');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  }
};

// Courses endpoints
export const courseService = {
  getCourses: async () => {
    const res = await api.get('/courses');
    return res.data;
  },
  getCourseLessons: async (courseId: string) => {
    const res = await api.get(`/courses/${courseId}/lessons`);
    return res.data;
  }
};

// Payments endpoints
export const paymentService = {
  // ─── CAMBIO APLICADO: Quitamos los headers para que Axios configure el boundary automáticamente ───
  uploadPayment: async (formData: FormData) => {
    const res = await api.post('/payments/upload', formData);
    return res.data;
  },
  // ────────────────────────────────────────────────────────────────────────────────────────────────
  
  getPayments: async () => {
    const res = await api.get('/payments');
    return res.data;
  },
  getUserPayments: async () => {
    const res = await api.get('/payments/user');
    return res.data;
  },
  updatePaymentStatus: async (paymentId: string, status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') => {
    const res = await api.put(`/payments/${paymentId}/status`, { status });
    return res.data;
  }
};

// Support endpoints
export const supportService = {
  createTicket: async (formData: FormData) => {
    const res = await api.post('/tickets/create', formData);
    return res.data;
  },
  getTickets: async () => {
    const res = await api.get('/tickets/user');
    return res.data;
  },
  getAllTickets: async () => {
    const res = await api.get('/tickets');
    return res.data;
  },
  getTicketById: async (ticketId: string) => {
    const res = await api.get(`/tickets/${ticketId}`);
    return res.data;
  },
  addMessage: async (ticketId: string, formData: FormData) => {
    const res = await api.post(`/tickets/${ticketId}/message`, formData);
    return res.data;
  },
  resolveTicket: async (ticketId: string) => {
    const res = await api.put(`/tickets/${ticketId}/resolve`);
    return res.data;
  }
};

// Progress endpoints
export const progressService = {
  getProgress: async (courseId: string) => {
    const res = await api.get(`/progress/${courseId}`);
    return res.data;
  },
  saveProgress: async (courseId: string, lessonKey: string, completed: boolean) => {
    const res = await api.post(`/progress/${courseId}`, { lessonKey, completed });
    return res.data;
  }
};

// Config & Demo Services
export const configService = {
  getDemoConfig: async () => {
    const res = await api.get('/config/demo-mode');
    return res.data;
  },
  resetDemo: async () => {
    const res = await api.post('/config/reset-demo');
    return res.data;
  }
};

export const demoService = {
  createDemoUser: async (data: { name: string; email: string; role: string }) => {
    const res = await api.post('/auth/demo-users', data);
    return res.data;
  },
  createCourse: async (data: { title: string; description: string; price: number; lessons: number }) => {
    const res = await api.post('/courses', data);
    return res.data;
  }
};