import axios from "axios";

const API = "http://localhost:3000/api/contacts";

const getTokenHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const contactService = {
  getAll: async () => {
    const res = await axios.get(API, { headers: getTokenHeader() });
    return res.data.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API}/${id}`, { headers: getTokenHeader() });
    return res.data.data;
  },

  create: async (formData) => {
    const res = await axios.post(API, formData, {
      headers: { ...getTokenHeader(), "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await axios.put(`${API}/${id}`, formData, {
      headers: { ...getTokenHeader(), "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  reply: async (id, formData) => {
    const res = await axios.post(`${API}/${id}/reply`, formData, {
      headers: { ...getTokenHeader(), "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  cancel: async (id) => {
    const res = await axios.put(`${API}/${id}/cancel`, null, {
      headers: getTokenHeader(),
    });
    return res.data;
  },
};

export default contactService;
