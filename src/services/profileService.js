import axios from "axios";
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.post(
            `${API_BASE_URL}/profile/change-password`,
            { currentPassword, newPassword, confirmPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to change password");
    }
};

const deleteAccount = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.delete(
            `${API_BASE_URL}/profile/delete-account`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete account");
    }
};

const getLoginHistory = async (page = 1, limit = 10) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            `${API_BASE_URL}/profile/login-history`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { page, limit },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch login history");
    }
};

export { changePassword, deleteAccount, getLoginHistory };