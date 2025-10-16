//Vo Lam Thuy Vi
import axiosInstance from "@/config/axiosConfig";

export const addToWishlist = async (productVariationId, note) => {
  const res = await axiosInstance.post(`/wishlists`, {
    product_variation_id: productVariationId,
    note,
  });
  return res.data;
};

export const getWishlist = async (page = 1, limit = 8) => {
  const res = await axiosInstance.get(`/wishlists`,{
    params: { page, limit },
  });
  return res.data;
};
