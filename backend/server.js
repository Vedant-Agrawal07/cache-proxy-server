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
import { stats } from "./stats.js";
import adminRoute from "./route/adminRoute.js";
import cors from "cors";
const ignoredPaths = [
  "/favicon.ico",
  "/robots.txt",
  "/.well-known/appspecific/com.chrome.devtools.json",
];

const app = express();
app.use(cors());
const startServer = async (options) => {
  if (!options.port) {
    console.error("no port");
    return;
  }
  if (!options.origin) {
    console.error("no path");
    return;
  }
  app.get("/api/health", async (req, res) => {
    res.status(200).json({ active: "active", timeStamp: Date.now() });
  });
  app.use("/api/admin", adminRoute);

  app.use(async (req, res) => {
    try {
      const startTime = Date.now();
      let requestData = {};
      if (ignoredPaths.includes(req.path)) {
        return res.sendStatus(404);
      }
      stats.totalRequests++;
      const reqPath = req.path;
      console.log("REQUEST:", req.method, req.originalUrl);
      requestData["reqPath"] = reqPath;
      const remoteUrl = `${options.origin}${reqPath}`;

      const hashFileName = generateHash(remoteUrl);

      let localFilePath = path.join(CACHE_DIR, reqPath);

      // chk redis HIT

      const redisData = await getRedisCache(hashFileName);

      if (redisData) {
        stats.cacheHits++;
        const headers = JSON.parse(redisData.headers);
        Object.keys(headers).forEach((key) => {
          res.setHeader(key, headers[key]);
        });
        console.log(`cache HIT at ${remoteUrl}`);
        res.setHeader("x-cache", "HIT-REDIS");
        const buffer = Buffer.from(redisData.resBody, "base64");
        const age = Date.now() - parseInt(redisData.createdAt);
        const latency = Date.now() - startTime;
        requestData["latency"] = latency;
        requestData["age"] = age;
        requestData["status"] = "HIT-REDIS";
        console.log("redis data", redisData);
        console.log("redis hit requestData", requestData);
        stats.recentRequests.push(requestData);
        res.send(buffer);
        return;
      }

      //chk prisma HIT

      const pathData = await getPrismaCache(hashFileName);

      if (pathData) {
        const expired = isExpired(pathData.createdAt);

        console.log(`is expired ? ${expired}`);

        if (!expired) {
          stats.cacheHits++;
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
            const age = Date.now() - new Date(pathData.createdAt).getTime();
            const latency = Date.now() - startTime;
            requestData["latency"] = latency;
            requestData["age"] = age;
            requestData["status"] = "HIT-DISK";
            console.log("disk data", pathData);
            console.log("disk hit requestData", requestData);
            stats.recentRequests.push(requestData);
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
      stats.cacheMisses = stats.totalRequests - stats.cacheHits;
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
      const latency = Date.now() - startTime;
      requestData["latency"] = latency;
      requestData["age"] = 0;
      requestData["status"] = "MISS";
      stats.recentRequests.push(requestData);
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
