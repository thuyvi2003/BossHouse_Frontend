// src/services/petService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const PET_API = `${API_BASE_URL}/pets`;

const petService = {
  // Lấy tất cả pets (User/Veterinarian)
  getAll: async () => {
    try {
      const res = await axiosInstance.get(PET_API);
      return res.data.data; // trả về mảng pets
    } catch (error) {
      console.error("Failed to fetch all pets:", error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy pet theo ID
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`${PET_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch pet ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy pets của user hiện tại
  getMyPets: async () => {
    try {
      const res = await axiosInstance.get(`${PET_API}/my-pets`);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch my pets:", error.response?.data || error.message);
      throw error;
    }
  },

  // Tạo pet mới
  create: async (petData) => {
    try {
      const res = await axiosInstance.post(PET_API, petData);
      return res.data.data;
    } catch (error) {
      console.error("Failed to create pet:", error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật pet
  update: async (id, petData) => {
    try {
      const res = await axiosInstance.put(`${PET_API}/${id}`, petData);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to update pet ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa pet
  remove: async (id) => {
    try {
      const res = await axiosInstance.delete(`${PET_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to delete pet ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Tìm kiếm pets
  search: async (query) => {
    try {
      const url = new URL(`${PET_API}/search`);
      url.searchParams.append("q", query);
      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error(`Failed to search pets with query "${query}":`, error.response?.data || error.message);
      throw error;
    }
  },

  // Lọc pets
  filter: async (criteria) => {
    try {
      const url = new URL(`${PET_API}/filter`);
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== "") url.searchParams.append(key, value);
      });
      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error("Failed to filter pets:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default petService;
