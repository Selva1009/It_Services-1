import { apiRequest } from "./http-client";
import { API_V1_PREFIX } from "./config";

export const getCartItemsByCustomerId = async (customerId, requestOptions = {}) => {
  return apiRequest(`${API_V1_PREFIX}/carts/${customerId}/items`, requestOptions);
};

export const addItemToCart = async ({ customerId, productId, quantity = 1 }, requestOptions = {}) => {
  return apiRequest(`${API_V1_PREFIX}/carts/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(requestOptions.headers || {}),
    },
    body: JSON.stringify({ customerId, productId, quantity }),
    ...requestOptions,
  });
};

export const updateCartItemQuantity = async ({ cartId, action }, requestOptions = {}) => {
  return apiRequest(`${API_V1_PREFIX}/carts/items/${cartId}/quantity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(requestOptions.headers || {}),
    },
    body: JSON.stringify({ action }),
    ...requestOptions,
  });
};

export const deleteCartItem = async (cartId, requestOptions = {}) => {
  return apiRequest(`${API_V1_PREFIX}/carts/items/${cartId}`, {
    method: "DELETE",
    ...requestOptions,
  });
};
