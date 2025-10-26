// src/services/bookingService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const BOOKING_API = `${API_BASE_URL}/bookings`;

const bookingService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get(BOOKING_API);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch all bookings:", error.response?.data || error.message);
      throw error;
    }
  },

  getBookingById: async (id) => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (booking) => {
    try {
      const res = await axiosInstance.post(BOOKING_API, booking);
      return res.data.data;
    } catch (error) {
      console.error("Failed to create booking:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, booking) => {
    try {
      const res = await axiosInstance.put(`${BOOKING_API}/${id}`, booking);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to update booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const res = await axiosInstance.delete(`${BOOKING_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to remove booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const url = new URL(`${BOOKING_API}/search`);
      url.searchParams.append("q", query);

      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error(`Failed to search bookings with query "${query}":`, error.response?.data || error.message);
      throw error;
    }
  },

  filter: async (status) => {
    try {
      const url = new URL(`${BOOKING_API}/filter`);
      url.searchParams.append("status", status);

      const res = await axiosInstance.get(url.toString());
      return res.data.data;
    } catch (error) {
      console.error(`Failed to filter bookings with status "${status}":`, error.response?.data || error.message);
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const res = await axiosInstance.put(`${BOOKING_API}/${id}/cancel`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  getMyBookings: async () => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/my-bookings`);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch my bookings:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default bookingService;
