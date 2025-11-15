import axiosInstance from "@/config/axiosConfig";

export const fetchRevenueStatistics = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/statistics/revenue", { params });
    return res.data?.data || res.data;
  } catch (error) {
    console.error("Failed to fetch revenue statistics:", error);
    throw error.response?.data || new Error("Failed to fetch statistics");
  }
};

export default {
  fetchRevenueStatistics,
};