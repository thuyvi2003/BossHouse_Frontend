// src/services/scheduleService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const SCHEDULE_API = `${API_BASE_URL}/schedules`; // plural, khớp backend

const scheduleService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get(SCHEDULE_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch schedules:", error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`${SCHEDULE_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch schedule ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (schedule) => {
    try {
      const res = await axiosInstance.post(SCHEDULE_API, schedule);
      return res.data.data;
    } catch (error) {
      console.error("Failed to create schedule:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, schedule) => {
    try {
      const res = await axiosInstance.put(`${SCHEDULE_API}/${id}`, schedule);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to update schedule ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const res = await axiosInstance.delete(`${SCHEDULE_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to delete schedule ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const url = new URL(`${SCHEDULE_API}/search`);
      url.searchParams.append("q", query);
      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error(`Failed to search schedules with query "${query}":`, error.response?.data || error.message);
      throw error;
    }
  },

  filter: async (filterObj) => {
    try {
      const url = new URL(`${SCHEDULE_API}/filter`);
      Object.keys(filterObj).forEach((key) =>
        url.searchParams.append(key, filterObj[key])
      );
      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error("Failed to filter schedules:", error.response?.data || error.message);
      throw error;
    }
  },

  getByVet: async (vetId) => {
    try {
      const res = await axiosInstance.get(`${SCHEDULE_API}/vet/${vetId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch schedules for vet ${vetId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  markUnavailable: async (id) => {
    try {
      const res = await axiosInstance.put(`${SCHEDULE_API}/${id}/unavailable`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to mark schedule ${id} unavailable:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default scheduleService;
