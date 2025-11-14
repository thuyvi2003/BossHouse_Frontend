// src/services/petTypeService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const PET_TYPE_API = `${API_BASE_URL}/pet-types`;

const petTypeService = {
  // Get all pet types (Admin/Staff/Veterinarian/User)
  getAll: async () => {
    try {
      const res = await axiosInstance.get(PET_TYPE_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch all pet types:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get pet type by ID (Admin/Staff/Veterinarian/User/Guest)
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`${PET_TYPE_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch pet type ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create pet type (Admin only)
  create: async (petTypeData) => {
    try {
      const res = await axiosInstance.post(PET_TYPE_API, petTypeData);
      return res.data.data;
    } catch (error) {
      console.error("Failed to create pet type:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update pet type (Admin only)
  update: async (id, petTypeData) => {
    try {
      const res = await axiosInstance.put(`${PET_TYPE_API}/${id}`, petTypeData);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to update pet type ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete pet type (Admin only)
  remove: async (id) => {
    try {
      const res = await axiosInstance.delete(`${PET_TYPE_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to delete pet type ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Search pet type (Admin/Staff)
  search: async (query) => {
    try {
      const url = new URL(`${PET_TYPE_API}/search`);
      url.searchParams.append("q", query);

      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error(`Failed to search pet types with query "${query}":`, error.response?.data || error.message);
      throw error;
    }
  },

  // Filter pet type (Admin/Staff)
  filter: async (criteria) => {
    try {
      const url = new URL(`${PET_TYPE_API}/filter`);
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== "") url.searchParams.append(key, value);
      });

      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error("Failed to filter pet types:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default petTypeService;
