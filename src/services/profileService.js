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

const getProfile = async () => {
    const response = await axiosInstance.get(`${API_BASE_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data.data;
};

const updateProfile = async (profileData) => {
    const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    });
    return response.data.data;
};

const uploadAvatar = async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const response = await axios.post(`${API_BASE_URL}/profile/avatar`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data.data;
};

const linkGoogle = async (idToken) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${API_BASE_URL}/profile/link-google`,
            { idToken },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to link Google account");
    }
};

const unlinkGoogle = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_BASE_URL}/profile/unlink-google`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to unlink Google account");
    }
};

export { changePassword, deleteAccount, getLoginHistory, getProfile, updateProfile, uploadAvatar, linkGoogle, unlinkGoogle, };