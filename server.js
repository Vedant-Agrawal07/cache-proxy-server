import fs from "fs";
import path from "path";
import express from "express";
import { extractHeaders, getContentInfo } from "./utils/responseUtils.js";
import { getRedisCache, setRedisCache } from "./redis/redisCache.js";

import {
  getPrismaCache,
  setPrismaCache,
  deletePrismaCache,
} from "./db/prismaCache.js";

import {
  fileExists,
  readFileBuffer,
  writeCacheFile,
  deleteCacheFile,
} from "./utils/fileCache.js";

import { CACHE_DIR, TTL } from "./utils/constants.js";
import { generateHash } from "./utils/hash.js";
import { isExpired } from "./utils/expireUtil.js";

const app = express();

const startServer = async (options) => {
  if (!options.port) {
    console.error("no port");
    return;
  }
  if (!options.origin) {
    console.error("no path");
    return;
  }

  app.use(async (req, res) => {
    try {
      const reqPath = req.path;
      const remoteUrl = `${options.origin}${reqPath}`;

      const hashFileName = generateHash(remoteUrl);

      let localFilePath = path.join(CACHE_DIR, reqPath);

      // chk redis HIT

      const redisData = await getRedisCache(hashFileName);

      if (redisData) {
        const headers = JSON.parse(redisData.headers);
        Object.keys(headers).forEach((key) => {
          res.setHeader(key, headers[key]);
        });
        console.log(`cache HIT at ${remoteUrl}`);
        res.setHeader("x-cache", "HIT-REDIS");
        const buffer = Buffer.from(redisData.resBody, "base64");
        res.send(buffer);
        return;
      }

      //chk prisma HIT

      const pathData = await getPrismaCache(hashFileName);

      if (pathData) {
        const isExpired = isExpired(pathData.createdAt);

        console.log(`is expired ? ${isExpired}`);

        if (!isExpired) {
          const absolutePath = path.resolve(pathData.localFilePath);

          if (fileExists(absolutePath)) {
            const buffer = readFileBuffer(absolutePath);
            const headers = JSON.parse(pathData.headers);

            await setRedisCache(hashFileName, buffer, pathData.headers);

            Object.keys(headers).forEach((key) => {
              res.setHeader(key, headers[key]);
            });

            console.log(`cache HIT at ${remoteUrl}`);
            res.setHeader("x-cache", "HIT-DISK");
            res.sendFile(absolutePath);
            return;
          }
        }
        await deletePrismaCache(hashFileName);
        deleteCacheFile(pathData.localFilePath);
      }

      const response = await fetch(remoteUrl);

      if (!response.ok) {
        res.status(response.status).send(await response.text());
        return;
      }

      console.log(`cache MISS at ${remoteUrl}`);

      const headers = extractHeaders(response, res);

      const { contentType, ext } = getContentInfo(response);

      localFilePath = path.join(localFilePath, hashFileName);
      localFilePath = `${localFilePath}.${ext}`;

      const buffer = Buffer.from(await response.arrayBuffer());
      writeCacheFile(localFilePath, buffer);

      const headersString = JSON.stringify(headers);

      try {
        await setPrismaCache(
          hashFileName,
          localFilePath,
          contentType,
          ext,
          headersString,
        );

        await setRedisCache(hashFileName, buffer, headersString);
      } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
        return;
      }

      res.setHeader("x-cache", "MISS");
      res.sendFile(path.resolve(localFilePath));
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.listen(options.port, () => {
    console.log(
      `servre running on port ${options.port} , origin ${options.origin}`,
    );
  });
};

export default startServer;
