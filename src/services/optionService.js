import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const optionService = {
  getUsers: async () => {
    const res = await axios.get(`${API_BASE}/users`);
    return res.data.data; // [{_id, name}, ...]
  },
  getCurrentUser: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data; // hoặc res.data.data nếu bạn gói dữ liệu
  },
  getPets: async () => {
    const res = await axios.get(`${API_BASE}/pets`);
    return res.data.data;
  },
  createPet: async (petData) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_BASE}/pets`, petData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data || res.data;
  },
  getServices: async () => {
    const res = await axios.get(`${API_BASE}/services`);
    return res.data.data;
  },
  getVets: async () => {
    const res = await axios.get(`${API_BASE}/veterinarians`);
    return res.data.data;
  },

  // Nếu muốn gọn hơn, có thể viết 1 hàm chung
  getAllOptions: async () => {
    const [users, pets, services, vets] = await Promise.all([
      optionService.getUsers(),
      optionService.getPets(),
      optionService.getServices(),
      optionService.getVets(),
    ]);
    return { users, pets, services, vets };
  },
};

export default optionService;
