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
      throw new Error(
        data.message || data || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Category API functions
export const categoryService = {
  // Get all categories with pagination and filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/categories?${queryString}`);
  },

  // Get category by ID
  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },

  // Create new category
  create: async (categoryData) => {
    return apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  // Update category
  update: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  // Delete category
  delete: async (id, hardDelete = false) => {
    return apiRequest(`/categories/${id}?hardDelete=${hardDelete}`, {
      method: "DELETE",
    });
  },

  // Search categories
  search: async (query, params = {}) => {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    return apiRequest(`/categories/search?${queryString}`);
  },

  // Get category statistics
  getStats: async () => {
    return apiRequest("/categories/stats");
  },
};

export default {
  categoryService,
};
