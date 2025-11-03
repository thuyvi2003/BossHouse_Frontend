const API_BASE_URL = "http://localhost:3000/api";
const getAuthToken = () => localStorage.getItem("token");
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  const res = await fetch(url, config);
  const contentType = res.headers.get("content-type");
  const data = contentType && contentType.includes("json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data.message || data || res.status);
  return data;
};
export const stockService = {
  getAll: async (params = {}) => apiRequest("/stocks?" + new URLSearchParams(params)),
  getById: async (id) => apiRequest(`/stocks/${id}`),
  create: async (stockData) => apiRequest("/stocks", { method: "POST", body: JSON.stringify(stockData) }),
  update: async (id, stockData) => apiRequest(`/stocks/${id}`, { method: "PUT", body: JSON.stringify(stockData) }),
  delete: async (id) => apiRequest(`/stocks/${id}`, { method: "DELETE" }),
  getStats: async () => apiRequest("/stocks/stats"),
};
export default stockService;

