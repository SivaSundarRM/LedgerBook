import { api } from "./client";

export const loansApi = {
  list: (search = "") => api.get(`/loans${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  create: (payload) => api.post("/loans", payload),
  makePayment: (id, amount) => api.post(`/loans/${id}/payments`, { amount }),
  restart: (id) => api.post(`/loans/${id}/restart`),
  profit: () => api.get("/loans/profit"),
  remove: (id) => api.delete(`/loans/${id}`),
};

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};
