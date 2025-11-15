// src/services/optionService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const USERS_API = `${API_BASE_URL}/users`;
const PETS_API = `${API_BASE_URL}/pets`;
const SERVICES_API = `${API_BASE_URL}/services`;
const VETS_API = `${API_BASE_URL}/veterinarians`;

const extractArray = (res) => {
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
};

const extractObject = (res) => res?.data?.data ?? res?.data ?? null;

const optionService = {
  getUsers: async () => {
    try {
      const res = await axiosInstance.get(USERS_API);
      return extractArray(res);
    } catch (error) {
      console.error("Failed to fetch users:", error.response?.data || error.message);
      return [];
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get(`${USERS_API}/me`);
      return extractObject(res);
    } catch (error) {
      console.error("Failed to fetch current user:", error.response?.data || error.message);
      return null;
    }
  },

  getPets: async () => {
    try {
      const res = await axiosInstance.get(PETS_API);
      return extractArray(res);
    } catch (error) {
      console.error("Failed to fetch pets:", error.response?.data || error.message);
      return [];
    }
  },

  createPet: async (petData) => {
    try {
      const res = await axiosInstance.post(PETS_API, petData);
      return extractObject(res);
    } catch (error) {
      console.error("Failed to create pet:", error.response?.data || error.message);
      throw error;
    }
  },

  getServices: async () => {
    try {
      const res = await axiosInstance.get(SERVICES_API);
      return extractArray(res);
    } catch (error) {
      console.error("Failed to fetch services:", error.response?.data || error.message);
      return [];
    }
  },

  getVets: async () => {
    try {
      const res = await axiosInstance.get(VETS_API);
      return extractArray(res);
    } catch (error) {
      console.error("Failed to fetch veterinarians:", error.response?.data || error.message);
      return [];
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

      // Map species nếu pet.species là ID
      const petsWithSpecies = pets.map((pet) => ({
        ...pet,
        species:
          typeof pet.species === "object"
            ? pet.species
            : { _id: pet.species || "unknown", name: pet.species_name || "Unknown" },
      }));

      return { users, pets: petsWithSpecies, services, vets };
    } catch (error) {
      console.error("Failed to fetch all options:", error.response?.data || error.message);
      return { users: [], pets: [], services: [], vets: [] };
    }
  },
};

export default optionService;
