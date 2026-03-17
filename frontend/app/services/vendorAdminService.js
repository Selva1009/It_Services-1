"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchVendorUsers = (vendorId) =>
  apiRequest({
    path: "/api/vendor-users/users",
    method: "POST",
    body: { vendorId },
  });

export const fetchVendorCompanyName = (vendorId) =>
  apiRequest({
    path: `/api/vendor-users/company-name/${vendorId}`,
  });

export const createVendorUser = (token, payload) =>
  apiRequest({
    path: "/api/vendor-user/signup",
    method: "POST",
    token,
    body: payload,
  });

export const transferProducts = (payload) =>
  apiRequest({
    path: "/api/products/transfer-products",
    method: "POST",
    body: payload,
  });

export const fetchVendorUserById = (vendorUserId) =>
  apiRequest({
    path: `/api/vendor-users/profile/${vendorUserId}`,
  });

export const updateVendorUserById = (vendorUserId, payload, token) =>
  apiRequest({
    path: `/api/vendor-users/profile/${vendorUserId}`,
    method: "PUT",
    token,
    body: payload,
  });
