"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

const normalizeRole = (role) => String(role || "").toLowerCase().replace(/-/g, "_");

export default function CustomerLayout({ children }) {
  const router = useRouter();
  useEffect(() => {
    ["/SignIn"].forEach((path) => router.prefetch(path));
  }, []);
  const [isVerified, setIsVerified] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    const role = normalizeRole(auth.role);
    const token = auth.authToken;

    if (role !== "it_user" || !token) {
      router.replace("/SignIn");
      return;
    }

    setIsVerified(true);
  }, [auth.role, auth.authToken, router]);

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
