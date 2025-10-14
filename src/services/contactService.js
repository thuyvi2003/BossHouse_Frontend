// src/services/contactService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const CONTACT_API = `${API_BASE_URL}/contacts`;

const contactService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get(CONTACT_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch contacts:", error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`${CONTACT_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch contact ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const res = await axiosInstance.post(CONTACT_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("Failed to create contact:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, formData) => {
    try {
      const res = await axiosInstance.put(`${CONTACT_API}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error(`Failed to update contact ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  reply: async (id, formData) => {
    try {
      const res = await axiosInstance.post(`${CONTACT_API}/${id}/reply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error(`Failed to reply contact ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const res = await axiosInstance.put(`${CONTACT_API}/${id}/cancel`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to cancel contact ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default contactService;
