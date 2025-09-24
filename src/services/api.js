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

// Category API functions
export const categoryAPI = {
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

// Product API functions
export const productAPI = {
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
    Object.keys(productData).forEach(key => {
      if (key !== 'image' && productData[key] !== null && productData[key] !== undefined) {
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
    Object.keys(productData).forEach(key => {
      if (key !== 'image' && productData[key] !== null && productData[key] !== undefined) {
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

// Product Variation API functions
export const variationAPI = {
  // Get all variations for a product
  getByProduct: async (productId) => {
    return apiRequest(`/variations/${productId}/variations`);
  },

  // Get variation by ID
  getById: async (id) => {
    return apiRequest(`/variations/${id}`);
  },

  // Create new variation
  create: async (productId, variationData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields (exclude image field to avoid duplication)
    Object.keys(variationData).forEach(key => {
      if (key !== 'image' && variationData[key] !== null && variationData[key] !== undefined) {
        formData.append(key, variationData[key]);
      }
    });
    
    // Add image if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return apiRequest(`/variations/${productId}/variations`, {
      method: "POST",
      body: formData,
    });
  },

  // Update variation
  update: async (id, variationData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields (exclude image field to avoid duplication)
    Object.keys(variationData).forEach(key => {
      if (key !== 'image' && variationData[key] !== null && variationData[key] !== undefined) {
        formData.append(key, variationData[key]);
      }
    });
    
    // Add image if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return apiRequest(`/variations/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  // Delete variation
  delete: async (id, hardDelete = false) => {
    return apiRequest(`/variations/${id}?hardDelete=${hardDelete}`, {
      method: "DELETE",
    });
  },

  // Get variation statistics
  getStats: async (productId = null) => {
    const params = productId ? `?productId=${productId}` : "";
    return apiRequest(`/variations/stats${params}`);
  },
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
  categoryAPI,
  productAPI,
  variationAPI,
  authAPI,
  promotionAPI,
  cartAPI,
};
