"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchVendorProfile = (token) =>
  apiRequest({
    path: "/api/vendors/profile",
    token,
    cache: "no-store",
  });

export const fetchVendorAdminProfile = (token) =>
  apiRequest({
    path: "/api/vendor-admin/profile",
    token,
    cache: "no-store",
  });

export const updateVendorAdminProfile = (token, payload) =>
  apiRequest({
    path: "/api/vendor-admin/profile",
    method: "PUT",
    token,
    body: payload,
  });

export const fetchVendorUserProfile = (token) =>
  apiRequest({
    path: "/api/vendor-user/profile",
    token,
  });

export const updateVendorUserProfile = (token, payload) =>
  apiRequest({
    path: "/api/vendor-user/profile",
    method: "PUT",
    token,
    body: payload,
  });

export const fetchCustomerProfile = (token) =>
  apiRequest({
    path: "/api/user-admin/profile",
    token,
    cache: "no-store",
  });

export const updateCustomerProfile = (token, payload) =>
  apiRequest({
    path: "/api/user-admin/profile",
    method: "PUT",
    token,
    body: payload,
  });

export const fetchCustomerUserProfile = (token) =>
  apiRequest({
    path: "/api/customer-users/profile",
    token,
  });

export const fetchItUserProfile = (token) =>
  apiRequest({
    path: "/api/it-user-employee/profile",
    token,
    cache: "no-store",
  });

export const updateItUserProfile = (token, payload) =>
  apiRequest({
    path: "/api/it-user-employee/profile",
    method: "PUT",
    token,
    body: payload,
  });
