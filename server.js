import fs from "fs";
import path from "path";
import express from "express";
import prisma from "./db/db.js";
import mime from "mime-types";
import crypto from "crypto";

const app = express();

// base path
const CACHE_DIR = path.join(process.cwd(), "cache");
// time to liev
const TTL = 24 * 60 * 60 * 1000;

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
      // convert file path to hash
      const hashFileName = crypto
        .createHash("sha256")
        .update(remoteUrl)
        .digest("hex");

        // subsequent fike path
      let localFilePath = path.join(CACHE_DIR, reqPath);
      const pathData = await prisma.path.findUnique({
        where: {
          hashFileName,
        },
      });

      if (pathData) {

        const isExpired = new Date(pathData.createdAt).getTime() + TTL < Date.now();

        if (!isExpired) {

          const absolutePath = path.resolve(pathData.localFilePath);

          if (fs.existsSync(absolutePath)) {

            const headers = JSON.parse(pathData.headers);
            
            Object.keys(headers).forEach((key) => {
              res.setHeader(key, headers[key]);
            });

            console.log(`cache HIT at ${remoteUrl}`);
            res.setHeader("x-cache", "HIT");
            res.sendFile(absolutePath);
            return;
          }
        }
        await prisma.path.delete({ where: { hashFileName } });
        fs.rmSync(absolutePath, { force: true, recursive: true });
      }

      const response = await fetch(remoteUrl);
      if (!response.ok) {
        res.status(response.status).send(await response.text());
        return;
      }

      console.log(`cache MISS at ${remoteUrl}`);

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
      console.log(headers);
      const contentType =
        response.headers.get("content-type") || `application/octet-stream`;
      const ext = mime.extension(contentType);
      localFilePath = path.join(localFilePath, hashFileName);
      localFilePath = `${localFilePath}.${ext}`;
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, buffer);
      const headersString = JSON.stringify(headers);
      try {
        await prisma.path.upsert({
          where: {
            hashFileName,
          },
          update: {
            localFilePath,
            contentType,
            extension: ext,
            headers: headersString,
          },
          create: {
            hashFileName,
            localFilePath,
            contentType,
            extension: ext,
            headers: headersString,
          },
        });
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
