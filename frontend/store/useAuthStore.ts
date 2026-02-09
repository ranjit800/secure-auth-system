import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
    email: string;
    isEmailVerified: boolean;
}

interface AuthStore {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<{ verificationToken?: string }>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),

    checkAuth: async () => {
        try {
            const response = await authAPI.getDashboard();
            if (response.data.success) {
                set({ user: response.data.data.user, loading: false });
            } else {
                set({ user: null, loading: false });
            }
        } catch (error) {
            set({ user: null, loading: false });
        }
    },

    login: async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        if (response.data.success) {
            // Refresh user data
            const dashResponse = await authAPI.getDashboard();
            set({ user: dashResponse.data.data.user });
        }
    },

    register: async (email: string, password: string) => {
        const response = await authAPI.register(email, password);
        return response.data.data || {};
    },

    logout: async () => {
        await authAPI.logout();
        set({ user: null });
    },

    logoutAll: async () => {
        await authAPI.logoutAll();
        set({ user: null });
    },
}));
