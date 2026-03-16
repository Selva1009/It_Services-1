"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/Components/DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";

const normalizeRole = (role) => String(role || "").toLowerCase().replace(/-/g, "_");

const readAuthValue = (key) => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
};

const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

export default function VendorDashboardLayout({ children }) {
  const router = useRouter();
  const [vendorUserId, setVendorUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, getRole, getVendorUserId, getAuthToken } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = normalizeRole(getRole() || readAuthValue("role") || auth.role);
    if (role && role !== "vendor_user") {
      router.replace("/SignIn");
      setIsLoading(false);
      return;
    }

    let storedVendorUserId = getVendorUserId() || readAuthValue("vendorUserId");

    if (!storedVendorUserId) {
      const authToken = getAuthToken() || readAuthValue("authToken");
      const payload = decodeJwtPayload(authToken);
      storedVendorUserId = payload?.id ? String(payload.id) : null;
    }

    if (!storedVendorUserId) {
      sessionStorage.removeItem("vendorUserId");
      router.replace("/SignIn");
      setIsLoading(false);
      return;
    }

    sessionStorage.setItem("vendorUserId", String(storedVendorUserId));
    setVendorUserId(storedVendorUserId);
    setIsLoading(false);
  }, [router]);

  if (isLoading || !vendorUserId) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  return <DashboardLayout id={vendorUserId}>{children}</DashboardLayout>;
}
