import fs from "fs";
import path from "path";
import prisma from "../db/db.js";
import client from "../redis/redisConnect.js";

export const cacheClear = async () => {
  const fPath = path.join(process.cwd(), "cache");
  await fs.rmSync(fPath, { force: true, recursive: true });
  await prisma.path.deleteMany({});
  await client.flushDb();
};

export default cacheClear;
