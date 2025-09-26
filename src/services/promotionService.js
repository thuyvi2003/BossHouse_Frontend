// src/services/promotionService.js
import API_BASE_URL from "@/config/api";

export async function getPromotionsList(page = 1, limit = 8) {
    const res = await fetch(`${API_BASE_URL}/promotions/admin?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch promotions: ${text}`);
    }

    const data = await res.json();
    console.log("Parsed data:", data);
    return data;
}

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

