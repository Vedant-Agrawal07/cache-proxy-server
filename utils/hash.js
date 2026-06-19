import crypto from "crypto";

export const generateHash = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
