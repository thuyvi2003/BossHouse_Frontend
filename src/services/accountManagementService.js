import axiosInstance from "@/config/axiosConfig";
import API_BASE_URL from "@/config/api";

const getAccounts = async (params = {}) => {
    const response = await axiosInstance.get(`${API_BASE_URL}/admin/account-management/accounts`, { params });
    return response.data;
};

const getAccountDetail = async (id) => {
    const response = await axiosInstance.get(`${API_BASE_URL}/admin/account-management/accounts/${id}`);
    return response.data;
};

const assignRole = async (id, role) => {
    const response = await axiosInstance.put(`${API_BASE_URL}/admin/account-management/accounts/${id}/role`, { role });
    return response.data;
};

const banUnbanAccount = async (id, status) => {
    const response = await axiosInstance.put(`${API_BASE_URL}/admin/account-management/accounts/${id}/ban`, { status });
    return response.data;
};

export { getAccounts, getAccountDetail, assignRole, banUnbanAccount };