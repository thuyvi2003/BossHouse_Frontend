// src/services/optionService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const USERS_API = `${API_BASE_URL}/users`;
const PETS_API = `${API_BASE_URL}/pets`;
const SERVICES_API = `${API_BASE_URL}/services`;
const VETS_API = `${API_BASE_URL}/veterinarians`;

const optionService = {
  getUsers: async () => {
    try {
      const res = await axiosInstance.get(USERS_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch users:", error.response?.data || error.message);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get(`${USERS_API}/me`);
      return res.data.data || res.data;
    } catch (error) {
      console.error("Failed to fetch current user:", error.response?.data || error.message);
      throw error;
    }
  },

  getPets: async () => {
    try {
      const res = await axiosInstance.get(PETS_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch pets:", error.response?.data || error.message);
      throw error;
    }
  },

  createPet: async (petData) => {
    try {
      const res = await axiosInstance.post(PETS_API, petData);
      return res.data.data || res.data;
    } catch (error) {
      console.error("Failed to create pet:", error.response?.data || error.message);
      throw error;
    }
  },

  getServices: async () => {
    try {
      const res = await axiosInstance.get(SERVICES_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch services:", error.response?.data || error.message);
      throw error;
    }
  },

  getVets: async () => {
    try {
      const res = await axiosInstance.get(VETS_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch veterinarians:", error.response?.data || error.message);
      throw error;
    }
  },

  getAllOptions: async () => {
    try {
      const [users, pets, services, vets] = await Promise.all([
        optionService.getUsers(),
        optionService.getPets(),
        optionService.getServices(),
        optionService.getVets(),
      ]);
      return { users, pets, services, vets };
    } catch (error) {
      console.error("Failed to fetch all options:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default optionService;
