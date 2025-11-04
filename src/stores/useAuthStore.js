import { create } from "zustand";
import axios from "axios";
import API_BASE_URL from '@/config/api';


export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            set({ token, user, isLoading: false });

            return { success: true, user: user }; // Return the user object
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                error: error.response?.data?.message || "Login failed",
            };
        }
    },

    googleLogin: async (idToken) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/google-login`, {
                idToken,
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            set({ token, user, isLoading: false });

            return { success: true, user: user };
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                error: error.response?.data?.message || "Google login failed",
            };
        }
    },

    checkAuth: async () => {
        try {
            const token = localStorage.getItem("token");
            const userJson = localStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;

            set({ token, user });
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    updateUser: (updatedUser) => {
        set((state) => {
            const newUser = { ...state.user, ...updatedUser };
            localStorage.setItem("user", JSON.stringify(newUser));
            return { user: newUser };
        });
    },

    logout: async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
    },
}));