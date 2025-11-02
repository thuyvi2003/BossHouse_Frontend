// Vo Lam Thuy Vi
import API_BASE_URL from "@/config/api";
import axiosInstance from "@/config/axiosConfig";


export const getUserCart = async () => {
  try {
    const res = await axiosInstance.get("/carts");
    console.log("Fetched user cart:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch cart:", error.response?.data || error.message);
    throw new Error("Failed to fetch cart");
  }
};

export const addToCart = async (variation_id, quantity = 1) => {
  try {
    const dataCart = await getUserCart();
    if (dataCart?.items?.length >= 5) {
      alert("You can only have 5 items in your cart. Remove one before adding a new one.");
      return 0;
    }
    const res = await axiosInstance.post("/carts/add", { variation_id, quantity });
    return res.data;
  } catch (error) {
    const errData = error.response?.data;
    console.error("Failed to add to cart:", errData || error.message);
    if (errData?.code === 0) {
      alert("You must remove one item before adding a new item to the cart.");
      return;
    }
    throw new Error(errData?.message || "Failed to add item to cart");
  }
};


export async function editCartItemQuantity(itemId, newQuantity) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/carts/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),

    })
    if (!res.ok) {
        const text = await res.text();
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa", newQuantity);
        console.error("Failed response:", text);
        throw new Error("Failed to edit quantity");
    }
    const data = await res.json();
    console.log("Parsed data:", data);
    return data;
}




export async function removeItem(variation_id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/carts`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variation_id }),
    })
    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to remove item");
    }
    const data = await res.json();
    console.log("Parsed data:", data);
    return data;
}
export async function clearAllCart() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/carts/clear`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to clear all");
    }
    return await res.json();
}
