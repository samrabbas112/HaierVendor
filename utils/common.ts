import { orderCodeStatus } from "@/libs/order/order-status";

export const dateTimeOptions = {
  weekday: "short", // 'Sun'
  year: "numeric", // '2024'
  month: "short", // 'Oct'
  day: "2-digit", // '06'
  hour: "2-digit", // '3'
  minute: "2-digit", // '17'
  second: "2-digit", // '27'
  hour12: true, // Use AM/PM format
};

export const resolveOrderStatus = (status: string) => {
  return orderCodeStatus[status] || { text: status, color: "primary" };
};
