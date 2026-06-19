import mime from "mime-types";

export const extractHeaders = (response, res) => {
  const headers = {};

  response.headers.forEach((value, key) => {
    const lowerCaseKey = key.toLowerCase();

    if (
      lowerCaseKey !== "content-encoding" &&
      !lowerCaseKey.includes("x-cache")
    ) {
      headers[key] = value;
      res.setHeader(key, value);
    }
  });

  return headers;
};

export const getContentInfo = (response) => {
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";

  const ext = mime.extension(contentType) || "bin";

  return {
    contentType,
    ext,
  };
};
