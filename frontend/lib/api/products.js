import { apiRequest, toQueryString } from "./http-client";
import { API_V1_PREFIX } from "./config";

const toPositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

export const getProducts = async ({
  page = 1,
  pageSize = 20,
  limit,
  search = "",
  category = "",
  price = "",
  vendorUserId,
  vendorAdminId,
} = {}, requestOptions = {}) => {
  const resolvedPageSize = toPositiveInteger(pageSize, toPositiveInteger(limit, 20));

  const query = toQueryString({
    page,
    pageSize: resolvedPageSize,
    search,
    category,
    price,
    vendorUserId,
    vendorAdminId,
  });

  return apiRequest(`${API_V1_PREFIX}/products/list${query}`, requestOptions);
};

export const getProductById = async (productId) => {
  return apiRequest(`${API_V1_PREFIX}/products/${productId}`);
};

export const deleteProductById = async (productId, token) => {
  return apiRequest(`${API_V1_PREFIX}/products/${productId}`, {
    method: "DELETE",
    headers: token
      ? {
        Authorization: `Bearer ${token}`,
      }
      : undefined,
  });
};
