// src/services/promotionService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

export const getPromotionsList = async (page = 1, limit = 8) => {
  const res = await axiosInstance.get("/promotions/admin", {
    params: { page, limit },
  });
  return res.data;
};

export async function createPromotion(promo) {
  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promo),
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed response:", text);
    throw new Error("Failed to fetch promotions");
  }
  return res.json();
}

export const removePromotion = async (id) => {
  try {
    const res = await axiosInstance.put(`/promotions/${id}`, {
      is_hidden: true, // gửi flag ẩn
    });

    console.log("Promotion removed:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Failed to remove promotion:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to remove promotion");
  }
};

export const updatePromotion = async (id, updateData) => {
  try {
    const res = await axiosInstance.put(`promotions/update/${id}`, updateData);
    console.log("Updated is sucess", res);
    return res.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to edit promotion");
  }
};

export const searchPromotions = async (code = "", status = "") => {
  const params = {};
  if (code) params.code = code;
  if (status) params.status = status;
  const res = await axiosInstance.get("/promotions/search", { params });
  return res.data;
};

export const getUserClaimedPromotions = async () => {
  return await axiosInstance.get("/promotions/claimed");
};

export const applyPromotion = async (promotionId) => {
  try {
    const res = await axiosInstance.post("/promotions/apply", {
      promotion_id: promotionId,
    });
    return res;
  } catch (error) {
    console.error(
      "Failed to apply promotion:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAvailablePromotions = async () => {
  return await axiosInstance.get("/promotions/available");
};

export const claimPromotion = async (promotionId) => {
  return await axiosInstance.post(`/promotions/${promotionId}/claim`);
};
