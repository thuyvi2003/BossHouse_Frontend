//Vo Lam Thuy Vi
import axiosInstance from "@/config/axiosConfig";

export const createOrder = async (promotionCode = null, shippingFee = 30000, addressInfo = {}) => {

    const res = await axiosInstance.post(`/orders/create`, {
        promotionCode,
        shippingFee,
        addressInfo,
    });
    return res.data;
}

export const getAllOrders = async (page = 1, limit = 8) =>{
const res = await axiosInstance.get(`/orders/admin/all`, {
    params: { page, limit },
  });
  return res.data;
}

export const getMyOrders = async (page = 1, limit = 8) => {
  const res = await axiosInstance.get(`/orders/my`, {
    params: { page, limit },
  });
  return res.data;
};