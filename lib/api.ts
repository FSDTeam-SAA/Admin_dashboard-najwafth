import { apiClient } from "./axios-client";

export async function getAdminOverview() {
  const response = await apiClient.get("/dashboard/admin/overview");
  return response.data.data;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data.data;
}

export async function forgotPassword(email: string) {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data.data;
}

export async function verifyOtp(payload: { email: string; otp: string }) {
  const response = await apiClient.post("/auth/verify-otp", payload);
  return response.data.data;
}

export async function resetPassword(payload: {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiClient.post("/auth/reset-password", payload);
  return response.data.data;
}

export async function getShops(params: { page: number; limit: number; status?: string; search?: string }) {
  const response = await apiClient.get("/shop", { params });
  return response.data.data;
}

export async function getShopById(shopId: string) {
  const response = await apiClient.get(`/shop/${shopId}`);
  return response.data.data;
}

export async function updateShopStatus(shopId: string, status: "verified" | "not verified") {
  const response = await apiClient.patch(`/shop/${shopId}/status`, { status });
  return response.data.data;
}

export async function getOrders(params: { page: number; limit: number; status?: string; vendorId?: string }) {
  const response = await apiClient.get("/order", { params });
  const payload = response.data.data || {};
  const orders = Array.isArray(payload) ? payload : payload.orders || [];
  const pagination = Array.isArray(payload) ? undefined : payload.pagination;
  return {
    orders,
    pagination: {
      total: pagination?.total ?? orders.length,
      page: pagination?.page ?? params.page,
      limit: pagination?.limit ?? params.limit,
      totalPages: pagination?.totalPages ?? 1,
    },
  };
}

export async function updateOrderStatus(orderId: string, payload: { status: string; trackingNumber?: string }) {
  const response = await apiClient.patch(`/order/${orderId}/status`, payload);
  return response.data.data;
}

export async function getDriverRequests(params: { page: number; limit: number }) {
  const response = await apiClient.get("/driver-request/driver-requests", { params });
  return response.data.data;
}

export async function updateDriverRequestStatus(id: string, status: string) {
  const response = await apiClient.patch(`/driver-request/driver-requests/${id}/update-status`, { status });
  return response.data.data;
}

export async function assignDriverToRequest(id: string, driverId: string) {
  const response = await apiClient.patch(`/driver-request/driver-requests/${id}/assign-driver`, { driverId });
  return response.data.data;
}

export async function getDriverRequestsByDriver(driverId: string) {
  const response = await apiClient.get(`/driver-request/driver-requests/driver/${driverId}`);
  return response.data.data;
}

export async function getCategories(params?: { includeProducts?: boolean }) {
  const response = await apiClient.get("/category", { params });
  return response.data.data;
}

export async function createCategory(formData: FormData) {
  const response = await apiClient.post("/category/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function updateCategory(id: string, formData: FormData) {
  const response = await apiClient.put(`/category/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function deleteCategory(id: string) {
  const response = await apiClient.delete(`/category/${id}`);
  return response.data.data;
}

export async function getProfile() {
  const response = await apiClient.get("/user/me");
  return response.data.data;
}

export async function getDrivers() {
  const response = await apiClient.get("/user/drivers");
  return response.data.data;
}

export async function updateProfile(formData: FormData) {
  const response = await apiClient.patch("/user/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiClient.patch("/user/change-password", payload);
  return response.data.data;
}
