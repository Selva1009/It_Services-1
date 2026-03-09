const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
export const API_V1_PREFIX = "/api/auth";
export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`;

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const resolveUploadUrl = (imagePathOrName) => {
  if (!imagePathOrName) return "/placeholder-product.svg";

  const normalized = String(imagePathOrName).trim();
  if (!normalized) return "/placeholder-product.svg";
  if (ABSOLUTE_URL_REGEX.test(normalized)) return normalized;

  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  return `${UPLOADS_BASE_URL}/${encodeURIComponent(normalized)}`;
};

export const resolveProductImageUrl = (product) =>
  resolveUploadUrl(product?.productImagePath || product?.productImage);
