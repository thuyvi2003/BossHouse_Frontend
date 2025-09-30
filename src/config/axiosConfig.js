import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/config/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
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

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and user data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    toast.error('Session expired. Please login again.');
                    break;
                case 403:
                    toast.error('You do not have permission to perform this action');
                    break;
                case 404:
                    toast.error('Requested resource not found');
                    break;
                case 500:
                    toast.error('System error. Please try again later');
                    break;
                default:
                    toast.error('An error occurred. Please try again');
            }
        } else if (error.request) {
            toast.error('Unable to connect to the server');
        } else {
            toast.error('An error occurred');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;