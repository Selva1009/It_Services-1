"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { bindTokenGetter } from "@/services/api";

export default function AuthApiBinder() {
  const { auth, getAuthToken } = useAuth();

  useEffect(() => {
    bindTokenGetter(() => getAuthToken() || auth?.authToken || null);
  }, [auth?.authToken, getAuthToken]);

  return null;
}
