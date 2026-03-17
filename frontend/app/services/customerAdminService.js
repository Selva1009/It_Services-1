"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchItUsers = (token) =>
  apiRequest({
    path: "/api/user-admin/It-users",
    token,
  });

export const fetchCustomerAdminCompanyName = (customerId) =>
  apiRequest({
    path: `/api/customer-users/company-name/${customerId}`,
  });

export const createCustomerUser = (payload) =>
  apiRequest({
    path: "/api/customer-users/customerUser",
    method: "POST",
    body: payload,
  });

export const updateCustomerUserProfile = (customerUserId, token, payload) =>
  apiRequest({
    path: `/api/customer-users/profile/${customerUserId}`,
    method: "PUT",
    token,
    body: payload,
  });
