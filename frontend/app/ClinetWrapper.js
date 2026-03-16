"use client";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";

export default function ClientWrapper({ children }) {
  useEffect(() => {
    const handleChunkError = (e) => {
      if (
        e?.message?.includes("Loading chunk") ||
        e?.message?.includes("ChunkLoadError")
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
