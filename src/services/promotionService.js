// src/services/promotionService.js
import API_BASE_URL from "@/config/api";

export async function getPromotionsList(page = 1, limit = 8, code ="", status="") {
    const token = localStorage.getItem("token");
    const url = new URL(`${API_BASE_URL}/promotions`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);
    if(code) url.searchParams.append("code", code);
    if(status) url.searchParams.append("status", status);

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
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

export async function removePromotion(id) {
    const token = localStorage.getItem("token")
     const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: "PUT",
        headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({is_hidden: true}), //Gui flag updated
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to remove promotion");
    }
    return res.json();
}
