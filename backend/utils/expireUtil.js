import { TTL } from "./constants.js";

export const isExpired = (createdAt) => {
  return new Date(createdAt).getTime() + TTL < Date.now();
};
