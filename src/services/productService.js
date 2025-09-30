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

// Product API functions
export const productService = {
  // Get all products with pagination and filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  // Get product by ID
  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Create new product
  create: async (productData, imageFile = null) => {
    const formData = new FormData();

    // Add text fields (exclude image field to avoid duplication)
    Object.keys(productData).forEach((key) => {
      if (
        key !== "image" &&
        productData[key] !== null &&
        productData[key] !== undefined
      ) {
        formData.append(key, productData[key]);
      }
    });

    // Add image if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return apiRequest("/products", {
      method: "POST",
      body: formData,
    });
  },

  // Update product
  update: async (id, productData, imageFile = null) => {
    const formData = new FormData();

    // Add text fields (exclude image field to avoid duplication)
    Object.keys(productData).forEach((key) => {
      if (
        key !== "image" &&
        productData[key] !== null &&
        productData[key] !== undefined
      ) {
        formData.append(key, productData[key]);
      }
    });

    // Add image if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return apiRequest(`/products/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  // Delete product
  delete: async (id, hardDelete = false) => {
    return apiRequest(`/products/${id}?hardDelete=${hardDelete}`, {
      method: "DELETE",
    });
  },

  // Search products
  search: async (query, params = {}) => {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    return apiRequest(`/products/search?${queryString}`);
  },

  // Get product statistics
  getStats: async () => {
    return apiRequest("/products/stats");
  },
};

export default { productService };
