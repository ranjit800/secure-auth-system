import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// API endpoints
export const authAPI = {
    // Register new user
    register: (email: string, password: string) =>
        api.post('/api/auth/register', { email, password }),

    // Login user
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),

    // Logout current device
    logout: () => api.post('/api/auth/logout'),

    // Logout all devices
    logoutAll: () => api.post('/api/auth/logout-all'),

    // Verify email
    verifyEmail: (token: string) =>
        api.get(`/api/auth/verify-email/${token}`),

    // Forgot password
    forgotPassword: (email: string) =>
        api.post('/api/auth/forgot-password', { email }),

    // Reset password
    resetPassword: (token: string, newPassword: string) =>
        api.post('/api/auth/reset-password', { token, newPassword }),

    // Get dashboard (protected)
    getDashboard: () => api.get('/api/dashboard'),
};

export const sessionAPI = {
    // Get all active sessions
    getSessions: () => api.get('/api/sessions'),

    // Revoke specific session
    revokeSession: (sessionId: string) =>
        api.delete(`/api/sessions/${sessionId}`),
};

export default api;
