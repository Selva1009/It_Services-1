"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const readStorageValue = (key) => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
};

const writeStorageValue = (key, value) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, value);
};

const removeStorageValue = (key) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
};

const safeJsonParse = (raw) => {
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
};

const buildAuthSnapshot = () => {
  const authToken = readStorageValue("authToken") || readStorageValue("token");
  const userToken = readStorageValue("userToken");
  const role = readStorageValue("role");
  const userId = readStorageValue("userId");
  const vendorId = readStorageValue("vendorId");
  const vendorUserId = readStorageValue("vendorUserId");
  const customerUserId = readStorageValue("customerUserId");
  const parentId = readStorageValue("parentId");
  const vendor = safeJsonParse(readStorageValue("vendor"));
  const vendorUser = safeJsonParse(readStorageValue("vendorUser"));
  const customer = safeJsonParse(readStorageValue("customer"));
  const customerUser = safeJsonParse(readStorageValue("customerUser"));

  const payload = decodeJwtPayload(authToken);
  const tokenUserId = payload?.id ? String(payload.id) : null;
  const tokenParentId = payload?.parentId ? String(payload.parentId) : null;

  const resolvedUserId =
    userId ||
    tokenUserId ||
    (vendor?.id ? String(vendor.id) : null) ||
    (vendorUser?.id ? String(vendorUser.id) : null) ||
    (customer?.id ? String(customer.id) : null) ||
    (customerUser?.id ? String(customerUser.id) : null);

  // ✅ userName based on role bucket
  const userName =
    vendorUser?.name ||
    customerUser?.name ||
    customer?.name ||
    vendor?.name ||
    null;

  const vendorName =
    vendor?.company_name ||
    vendorUser?.company_name ||
    null;

  const customerName =
    customer?.company_name ||
    customerUser?.company_name ||
    null;

  return {
    authToken,
    token: authToken,
    userToken,
    role,
    userId: resolvedUserId,
    parentId: parentId || tokenParentId,
    vendorId: vendorId || tokenParentId,
    vendorUserId,
    customerUserId,
    userName,
    vendorName,
    customerName,
    vendor,
    vendorUser,
    customer,
    customerUser,
    extra: {},
  };
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => buildAuthSnapshot());

  useEffect(() => {
    setAuth((prev) => ({ ...prev, ...buildAuthSnapshot() }));
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setAuth((prev) => ({ ...prev, ...buildAuthSnapshot() }));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ Main login handler — maps data.user to correct role bucket
  const setAuthFromLogin = useCallback((loginData = {}) => {
    const {
      authToken,
      userToken,
      role,
      id,
      user,
    } = loginData || {};

    const normalizedRole = String(role || "").toLowerCase().replace(/-/g, "_");
    const payload = decodeJwtPayload(authToken);

    const resolvedUserId = id || user?.id || payload?.id
      ? String(id || user?.id || payload?.id)
      : null;

    const resolvedParentId = user?.parentId || user?.admin_id || user?.vendor_id || payload?.parentId
      ? String(user?.parentId || user?.admin_id || user?.vendor_id || payload?.parentId)
      : null;

    // ✅ Map data.user to correct bucket based on role
    const vendor       = normalizedRole === "vendor_admin" ? user : null;
    const vendorUser   = normalizedRole === "vendor_user"  ? user : null;
    const customer     = normalizedRole === "it_admin"     ? user : null;
    const customerUser = normalizedRole === "it_user"      ? user : null;

    // ✅ Save to sessionStorage
    if (authToken) {
      writeStorageValue("authToken", authToken);
      writeStorageValue("token", authToken);
    }
    if (userToken)        writeStorageValue("userToken", userToken);
    if (normalizedRole)   writeStorageValue("role", normalizedRole);
    if (resolvedUserId)   writeStorageValue("userId", resolvedUserId);
    if (resolvedParentId) writeStorageValue("parentId", resolvedParentId);

    if (normalizedRole === "vendor_admin") {
      writeStorageValue("vendorId", resolvedUserId);
      writeStorageValue("vendor", JSON.stringify(vendor));
    }

    if (normalizedRole === "vendor_user") {
      writeStorageValue("vendorUserId", resolvedUserId);
      writeStorageValue("vendorId", resolvedParentId);
      writeStorageValue("vendorUser", JSON.stringify(vendorUser));
    }

    if (normalizedRole === "it_admin") {
      writeStorageValue("adminId", resolvedUserId);
      writeStorageValue("customerUserId", resolvedUserId);
      writeStorageValue("customer", JSON.stringify(customer));
    }

    if (normalizedRole === "it_user") {
      writeStorageValue("customerUserId", resolvedUserId);
      writeStorageValue("adminId", resolvedParentId);
      writeStorageValue("customerUser", JSON.stringify(customerUser));
    }

    // ✅ Update auth state
    setAuth((prev) => ({
      ...prev,
      authToken:      authToken || prev.authToken,
      token:          authToken || prev.authToken,
      userToken:      userToken || prev.userToken,
      role:           normalizedRole || prev.role,
      userId:         resolvedUserId || prev.userId,
      parentId:       resolvedParentId || prev.parentId,
      vendorId:       normalizedRole === "vendor_admin" ? resolvedUserId
                    : normalizedRole === "vendor_user"  ? resolvedParentId
                    : prev.vendorId,
      vendorUserId:   normalizedRole === "vendor_user"  ? resolvedUserId : prev.vendorUserId,
      customerUserId: normalizedRole === "it_admin" || normalizedRole === "it_user"
                    ? resolvedUserId : prev.customerUserId,
      userName:       user?.name || prev.userName,
      vendorName:     vendor?.company_name || vendorUser?.company_name || prev.vendorName,
      customerName:   customer?.company_name || customerUser?.company_name || prev.customerName,
      vendor:         vendor || prev.vendor,
      vendorUser:     vendorUser || prev.vendorUser,
      customer:       customer || prev.customer,
      customerUser:   customerUser || prev.customerUser,
      extra:          { message: loginData.message },
    }));
  }, []);

  const setVendor = useCallback((vendorData) => {
    writeStorageValue("vendor", JSON.stringify(vendorData));
    setAuth((prev) => ({
      ...prev,
      vendor: vendorData,
      vendorName: vendorData?.company_name || prev.vendorName,
      userName: vendorData?.name || prev.userName,
      userId: vendorData?.id ? String(vendorData.id) : prev.userId,
    }));
  }, []);

  const setVendorUser = useCallback((vendorUserData) => {
    writeStorageValue("vendorUser", JSON.stringify(vendorUserData));
    setAuth((prev) => ({
      ...prev,
      vendorUser: vendorUserData,
      userName: vendorUserData?.name || prev.userName,
      vendorName: vendorUserData?.company_name || prev.vendorName,
      vendorUserId: vendorUserData?.id ? String(vendorUserData.id) : prev.vendorUserId,
    }));
  }, []);

  const setCustomer = useCallback((customerData) => {
    writeStorageValue("customer", JSON.stringify(customerData));
    setAuth((prev) => ({
      ...prev,
      customer: customerData,
      customerName: customerData?.company_name || prev.customerName,
      userName: customerData?.name || prev.userName,
      userId: customerData?.id ? String(customerData.id) : prev.userId,
    }));
  }, []);

  const setCustomerUser = useCallback((customerUserData) => {
    writeStorageValue("customerUser", JSON.stringify(customerUserData));
    setAuth((prev) => ({
      ...prev,
      customerUser: customerUserData,
      userName: customerUserData?.name || prev.userName,
      customerName: customerUserData?.company_name || prev.customerName,
      customerUserId: customerUserData?.id ? String(customerUserData.id) : prev.customerUserId,
    }));
  }, []);

  const clearAuth = useCallback(() => {
    [
      "authToken", "token", "userToken", "role",
      "userId", "parentId", "vendorId", "vendorUserId",
      "customerUserId", "adminId", "vendor", "vendorUser",
      "customer", "customerUser",
    ].forEach(removeStorageValue);
    setAuth(buildAuthSnapshot());
  }, []);

  const getAuthToken     = useCallback(() => auth.authToken     || readStorageValue("authToken"), [auth.authToken]);
  const getUserToken     = useCallback(() => auth.userToken     || readStorageValue("userToken"), [auth.userToken]);
  const getRole          = useCallback(() => auth.role          || readStorageValue("role"), [auth.role]);
  const getUserId        = useCallback(() => auth.userId        || readStorageValue("userId"), [auth.userId]);
  const getParentId      = useCallback(() => auth.parentId      || readStorageValue("parentId"), [auth.parentId]);
  const getVendorId      = useCallback(() => auth.vendorId      || readStorageValue("vendorId"), [auth.vendorId]);
  const getVendorUserId  = useCallback(() => auth.vendorUserId  || readStorageValue("vendorUserId"), [auth.vendorUserId]);
  const getCustomerUserId= useCallback(() => auth.customerUserId|| readStorageValue("customerUserId"), [auth.customerUserId]);
  const getUserName      = useCallback(() => auth.userName, [auth.userName]);
  const getVendorName    = useCallback(() => auth.vendorName, [auth.vendorName]);
  const getCustomerName  = useCallback(() => auth.customerName, [auth.customerName]);

  const value = useMemo(() => ({
    auth,
    setAuth,
    setAuthFromLogin,
    setVendor,
    setVendorUser,
    setCustomer,
    setCustomerUser,
    clearAuth,
    getAuthToken,
    getUserToken,
    getRole,
    getUserId,
    getParentId,
    getVendorId,
    getVendorUserId,
    getCustomerUserId,
    getUserName,
    getVendorName,
    getCustomerName,
  }), [
    auth,
    setAuthFromLogin,
    setVendor,
    setVendorUser,
    setCustomer,
    setCustomerUser,
    clearAuth,
    getAuthToken,
    getUserToken,
    getRole,
    getUserId,
    getParentId,
    getVendorId,
    getVendorUserId,
    getCustomerUserId,
    getUserName,
    getVendorName,
    getCustomerName,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}