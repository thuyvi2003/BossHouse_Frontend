// src/services/promotionService.js
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

export const getPromotionsList = async (page = 1, limit = 8) => {
    console.log("dôdoododododo")
    const res = await axiosInstance.get("/promotions/admin", { params: { page, limit } });
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

export async function removePromotion(id) {
    const token = localStorage.getItem("token")
    const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_hidden: true }), //Gui flag updated
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to remove promotion");
    }
    return res.json();
}
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
        const res = await axiosInstance.post("/promotions/apply", { promotion_id: promotionId });
        return res;
    } catch (error) {
        console.error("Failed to apply promotion:", error.response?.data || error.message);
        throw error;
    }
};

export const getAvailablePromotions = async () => {
    return await axiosInstance.get("/promotions/available");
}

export const claimPromotion = async (promotionId) => {
    return await axiosInstance.post(`/promotions/${promotionId}/claim`);
}
