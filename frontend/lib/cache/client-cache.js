"use client";

const memoryCache = new Map();
const inFlightRequests = new Map();

const now = () => Date.now();

const getStorageValue = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    if (parsed.expiresAt && parsed.expiresAt < now()) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data ?? null;
  } catch {
    return null;
  }
};

const setStorageValue = (key, value, ttlMs) => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data: value,
        expiresAt: now() + ttlMs,
      })
    );
  } catch {
    // Ignore storage quota errors.
  }
};

export const fetchCachedJson = async (cacheKey, fetcher, ttlMs = 5 * 60 * 1000) => {
  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry && memoryEntry.expiresAt > now()) {
    return memoryEntry.data;
  }

  const storageValue = getStorageValue(cacheKey);
  if (storageValue !== null) {
    memoryCache.set(cacheKey, { data: storageValue, expiresAt: now() + ttlMs });
    return storageValue;
  }

  const activeRequest = inFlightRequests.get(cacheKey);
  if (activeRequest) {
    return activeRequest;
  }

  const request = fetcher()
    .then((data) => {
      memoryCache.set(cacheKey, { data, expiresAt: now() + ttlMs });
      setStorageValue(cacheKey, data, ttlMs);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);
  return request;
};
