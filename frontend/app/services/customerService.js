"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchCustomerVouchers = (customerUserId) =>
  apiRequest({
    path: `/api/voucher-management/customer-users/${customerUserId}/vouchers`,
  });
