"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const normalizeRole = (role) => String(role || "").toLowerCase().replace(/-/g, "_");

const readAuthValue = (key) => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
};

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const role = normalizeRole(readAuthValue("role"));
    const token = readAuthValue("token");

    if (role !== "it_user" || !token) {
      router.replace("/SignIn");
      return;
    }

    setIsVerified(true);
  }, [router]);

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
