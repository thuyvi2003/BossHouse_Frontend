// Vo Lam Thuy Vi
import axios from "axios";
import API_BASE_URL from "./api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm interceptor để tự động gắn token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // hoặc "token" tùy bạn lưu
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý lỗi response chung
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
        } else {
            console.error("Network Error:", error.message);
        }

        // Nếu token hết hạn → logout
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
