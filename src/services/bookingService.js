import axios from "axios";

const API = "http://localhost:3000/api/bookings"; // đúng port backend

const bookingService = {
  getAll: async () => {
    const res = await axios.get(API);
    return res.data.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API}/${id}`);
    return res.data.data;
  },

  create: async (data) => {
    const res = await axios.post(API, data);
    return res.data.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data);
    return res.data.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`${API}/${id}`);
    return res.data.data;
  },

  search: async (query) => {
    const res = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
    return res.data.data;
  },

  filter: async (status) => {
    const res = await axios.get(`${API}/filter?status=${status}`);
    return res.data.data;
  },

  cancel: async (id) => {
    const res = await axios.put(`${API}/${id}/cancel`);
    return res.data.data;
  },
};

export default bookingService;
