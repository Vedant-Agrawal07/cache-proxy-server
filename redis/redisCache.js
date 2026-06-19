import client from "./redisConnect.js";

export const getRedisCache = async (hashFileName) => {
  const redisData = await client.hGetAll(hashFileName);

  if (Object.keys(redisData).length === 0) {
    return null;
  }

  return redisData;
};

export const setRedisCache = async (hashFileName, buffer, headersString) => {
  await client.hSet(hashFileName, {
    hashFileName,
    resBody: buffer.toString("base64"),
    headers: headersString,
    createdAt: Date.now(),
  });

  await client.expire(hashFileName, 86400);
};
