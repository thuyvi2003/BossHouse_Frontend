import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const EVENT_API = `${API_BASE_URL}/events`;

const eventService = {
  // Lấy tất cả events
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.is_featured !== undefined) params.append("is_featured", filters.is_featured);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.skip) params.append("skip", filters.skip);

      const url = params.toString() ? `${EVENT_API}?${params}` : EVENT_API;
      const res = await axiosInstance.get(url);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch events:", error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy event theo ID
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`${EVENT_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Tạo event mới (admin only)
  create: async (event) => {
    try {
      const res = await axiosInstance.post(EVENT_API, event);
      return res.data.data;
    } catch (error) {
      console.error("Failed to create event:", error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật event (admin only)
  update: async (id, event) => {
    try {
      const res = await axiosInstance.put(`${EVENT_API}/${id}`, event);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to update event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa event (admin only)
  delete: async (id) => {
    try {
      const res = await axiosInstance.delete(`${EVENT_API}/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to delete event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa vĩnh viễn event (admin only)
  permanentDelete: async (id) => {
    try {
      const res = await axiosInstance.delete(`${EVENT_API}/${id}/permanent`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to permanently delete event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Tìm kiếm events
  search: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.skip) params.append("skip", filters.skip);

      const res = await axiosInstance.get(`${EVENT_API}/search?${params}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to search events with query "${query}":`, error.response?.data || error.message);
      throw error;
    }
  },

  // Lọc events
  filter: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.is_featured !== undefined) params.append("is_featured", filters.is_featured);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.skip) params.append("skip", filters.skip);

      const url = params.toString() ? `${EVENT_API}/filter?${params}` : `${EVENT_API}/filter`;
      const res = await axiosInstance.get(url);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to filter events:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Đăng ký event
  register: async (id) => {
    try {
      const res = await axiosInstance.post(`${EVENT_API}/${id}/register`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to register for event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Hủy đăng ký event
  cancelRegistration: async (id) => {
    try {
      const res = await axiosInstance.post(`${EVENT_API}/${id}/cancel`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to cancel registration for event ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy danh sách đăng ký của user
  getMyRegistrations: async () => {
    try {
      const res = await axiosInstance.get(`${EVENT_API}/my/registrations`);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch my registrations:", error.response?.data || error.message);
      throw error;
    }
  },

  // Upload image (admin only)
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(`${EVENT_API}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.url;
    } catch (error) {
      console.error("Failed to upload image:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default eventService;

