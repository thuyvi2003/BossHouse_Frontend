// Vo Lam Thuy Vi
import API_BASE_URL from "@/config/api";
export async function addToCart(variation_id, quantity = 1) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/carts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variation_id, quantity }),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to fetch promotions");
    }

    const data = await res.json();
    console.log("Parsed data:", data);
    return data;
}

export async function getUserCart() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/carts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
    console.log("Response status:", res.status);

    if (!res.ok) {
        const text = await res.text();
        console.error("Failed response:", text);
        throw new Error("Failed to fetch promotions");
    }

    const data = await res.json();
    console.log("Parsed data:", data);
    return data;
}


export async function editCartItemQuantity (itemId, newQuantity ) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/carts/${itemId}`,{
         method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity}), 

    })
    if (!res.ok) {
        const text = await res.text();
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa",newQuantity);
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
