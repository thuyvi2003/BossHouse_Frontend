//Vo Lam Thuy Vi
import axiosInstance from "@/config/axiosConfig";

export const createOrder = async (
  selectedItemIds = [],
  promotionCode = null,
  shippingFee = 30000,
  addressInfo = {}
) => {
  const res = await axiosInstance.post(`/orders/create`, {
    selectedItemIds,
    promotionCode,
    shippingFee,
    addressInfo,
  });
  return res.data;
};

export const getAllOrders = async (page = 1, limit = 8) => {
  const res = await axiosInstance.get(`/orders/admin/all`, {
    params: { page, limit },
  });
  return res.data;
};

export const getMyOrders = async (page = 1, limit = 8, status = "all") => {
  const res = await axiosInstance.get(`/orders/my`, {
    params: { page, limit, status },
  });
  return res.data;
};

export const searchOrders = async (search, status, page = 1, limit = 8) => {
  // send search both as orderId and userName so backend can match either
  const res = await axiosInstance.get(`/orders/admin/search`, {
    params: { search, status, page, limit },
  });
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await axiosInstance.patch(`/orders/${orderId}/status`, {
    status,
  });
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await axiosInstance.patch(`/orders/${orderId}/cancel`);
  return res.data;
};

export const verifyVnpayReturn = async (queryObj) => {
  const res = await axiosInstance.get(`/orders/vnpay_return`, {
    params: queryObj,
  });
  return res.data;
};
