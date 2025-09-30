// API Service for BossHouse Frontend
const API_BASE_URL = "http://localhost:3000/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions = {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    let data;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};


// Auth API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest("/auth/me");
  },

  // Logout
  logout: async () => {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};

// Promotion API functions
export const promotionAPI = {
  // Get all promotions
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/promotions?${queryString}`);
  },

  // Get promotion by ID
  getById: async (id) => {
    return apiRequest(`/promotions/${id}`);
  },

  // Create new promotion
  create: async (promotionData) => {
    return apiRequest("/promotions", {
      method: "POST",
      body: JSON.stringify(promotionData),
    });
  },

  // Update promotion
  update: async (id, promotionData) => {
    return apiRequest(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(promotionData),
    });
  },

  // Delete promotion
  delete: async (id, hardDelete = false) => {
    return apiRequest(`/promotions/${id}?hardDelete=${hardDelete}`, {
      method: "DELETE",
    });
  },

  // Get promotion statistics
  getStats: async () => {
    return apiRequest("/promotions/stats");
  },
};

// Cart API functions
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    return apiRequest("/carts");
  },

  // Add item to cart
  addItem: async (itemData) => {
    return apiRequest("/carts/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  // Update cart item
  updateItem: async (itemId, quantity) => {
    return apiRequest(`/carts/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    return apiRequest(`/carts/items/${itemId}`, {
      method: "DELETE",
    });
  },

  // Clear cart
  clearCart: async () => {
    return apiRequest("/carts", {
      method: "DELETE",
    });
  },
};

export default {
  authAPI,
  promotionAPI,
  cartAPI,
};
