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
  const res = await axiosInstance.get(`/wishlists`, {
    params: { page, limit },
  });
  return res.data;
};

export const removeWishlistItem = async (id) => {
  const res = await axiosInstance.delete(`/wishlists/delete/${id}`);
  return res.data;
};

export const clearAllWishlist = async (groupId = null) => {
  const res = await axiosInstance.delete(`/wishlists/clear`, {
    params: groupId ? { group_id: groupId } : {},
  });
  return res.data;
};

export const moveToCart = async (id) => {
  const res = await axiosInstance.patch(`/wishlists/${id}/move-to-cart`);
  return res.data;
};

export const markAsPurchased = async (id) => {
  const res = await axiosInstance.patch(`/wishlists/${id}/mask-as-purchased`);
  return res.data;
}

export const moveToGroup = async (id, newGroupId) => {
if (!id || !newGroupId) {
      throw new Error("Missing wishlist item ID or group ID");
}
  const res = await axiosInstance.patch(`/wishlists/${id}/move-to-group`, {
    newGroupId,
  });
  return res.data;
};

export const getWishlistGroups = async () => {
  const res = await axiosInstance.get(`/wishlists/groups`);
  return res.data;
};


export const createWishlistGroup = async (name, description = "") => {
  const res = await axiosInstance.post(`/wishlists/groups/create`, {
    name,
    description,
  });
  return res.data;
};


export const shareWishlistGroup = async (groupId, visibility = "public") => {
  const res = await axiosInstance.post(`/wishlists/share/${groupId}`, {
    visibility,
  });
  return res.data;
};

export const getSharedWishlistGroup = async (groupId) => {
  const res = await axiosInstance.get(`/wishlists/shared/${groupId}`);
  return res.data;
};


export const disableShare = async (groupId) => {
  const res = await axiosInstance.patch(`/wishlists/groups/${groupId}/unshare`);
  return res.data;
};