import axiosInstance from "@/config/axiosConfig";

export const getMemberships = async (page = 1, limit = 10, search = "") => {
  const res = await axiosInstance.get("/memberships", { params: { page, limit, search } });
  return res.data;
};

export const getMembershipById = async (id) => {
  const res = await axiosInstance.get(`/memberships/${id}`);
  return res.data;
};

export const createMembership = async (payload) => {
  const res = await axiosInstance.post("/memberships", payload);
  return res.data;
};

export const updateMembership = async (id, payload) => {
  const res = await axiosInstance.put(`/memberships/${id}`, payload);
  return res.data;
};

export const softDeleteMembership = async (id) => {
  // Backend delete là soft-delete
  const res = await axiosInstance.delete(`/memberships/${id}`);
  return res.data;
};