export const CART_UPDATED_EVENT = "cart:updated";
export const CUSTOMER_USER_UPDATED_EVENT = "customer:user-updated";

const dispatchWindowEvent = (eventName) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
};

export const notifyCartUpdated = () => {
  dispatchWindowEvent(CART_UPDATED_EVENT);
};

export const notifyCustomerUserUpdated = () => {
  dispatchWindowEvent(CUSTOMER_USER_UPDATED_EVENT);
};
