import axios from "axios";

const API = "http://localhost:3000/api/bookings";

const bookingService = {
  getAll: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  getById: async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  create: async (data) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  update: async (id, data) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  remove: async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  search: async (query) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  filter: async (status) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/filter?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  cancel: async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API}/${id}/cancel`, null, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  getMyBookings: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },
};

export default bookingService;
