// src/services/bookingService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const BOOKING_API = `${API_BASE_URL}/bookings`;

const extractData = (res) => res?.data?.data ?? res?.data ?? null;

const bookingService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get(BOOKING_API);
      return extractData(res) || [];
    } catch (error) {
      console.error("Failed to fetch all bookings:", error.response?.data || error.message);
      return [];
    }
  },

  getBookingById: async (id) => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/${id}`);
      return extractData(res);
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (booking) => {
    try {
      const res = await axiosInstance.post(BOOKING_API, booking);
      return extractData(res);
    } catch (error) {
      console.error("Failed to create booking:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, booking) => {
    try {
      const res = await axiosInstance.put(`${BOOKING_API}/${id}`, booking);
      return extractData(res);
    } catch (error) {
      console.error(`Failed to update booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const res = await axiosInstance.delete(`${BOOKING_API}/${id}`);
      return extractData(res);
    } catch (error) {
      console.error(`Failed to remove booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/search?q=${query}`);
      return extractData(res) || [];
    } catch (error) {
      console.error(`Failed to search bookings:`, error.response?.data || error.message);
      return [];
    }
  },

  filter: async (status) => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/filter?status=${status}`);
      return extractData(res) || [];
    } catch (error) {
      console.error(`Failed to filter bookings:`, error.response?.data || error.message);
      return [];
    }
  },

  cancel: async (id) => {
    try {
      const res = await axiosInstance.put(`${BOOKING_API}/${id}/cancel`);
      return extractData(res);
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  getMyBookings: async () => {
    try {
      const res = await axiosInstance.get(`${BOOKING_API}/my-bookings`);
      return extractData(res) || [];
    } catch (error) {
      console.error(`Failed to fetch my bookings:`, error.response?.data || error.message);
      return [];
    }
  },
};

export default bookingService;
