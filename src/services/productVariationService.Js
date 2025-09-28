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

// Product Variation API functions
export const variationService = {
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

export default { variationService };