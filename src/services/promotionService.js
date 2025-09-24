// Vo Lam Thuy Vi

import API_BASE_URL from "@/config/api";
export async function getPromotionsList() {
    const res = await fetch(`${API_BASE_URL}/promotions`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
     if (!res.ok) {
    throw new Error("Failed to fetch promotions");
  }
    return res.json();
}