import client, { isRedisConnect } from "./redisConnect.js";

export const getRedisCache = async (hashFileName) => {
  if (!isRedisConnect) {
    return null;
  }
  try {
    const redisData = await client.hGetAll(hashFileName);

    if (Object.keys(redisData).length === 0) {
      return null;
    }
    return redisData;
  } catch (error) {
    return null;
  }
};

export const setRedisCache = async (hashFileName, buffer, headersString) => {
  if (!isRedisConnect) {
    return;
  }
  try {
    await client.hSet(hashFileName, {
      hashFileName,
      resBody: buffer.toString("base64"),
      headers: headersString,
      createdAt: Date.now(),
    });

    await client.expire(hashFileName, 86400);
  } catch (error) {
    console.error("Redis unavailable", error.message);
  }
};
