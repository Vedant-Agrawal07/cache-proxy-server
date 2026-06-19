import fs from "fs";
import path from "path";
import prisma from "../db/db.js";
const getTime = (temp) => {
  let ans;
  if (temp < 60000) {
    ans = `${Math.floor(temp / 1000)}s`;
  } else if (temp >= 60000 && temp < 360000) {
    ans = `${Math.floor(temp / 60000)}m`;
  } else if (temp >= 3600000) {
    ans = `${Math.floor(temp / 3600000)}h`;
  }
  return ans;
};
export const cacheStats = async () => {
  const tot_files = await prisma.path.count();
  if (tot_files == 0) {
    console.log("NO cached files");
    return;
  }
  let tot_size = 0;
  const cacheFiles = await prisma.path.findMany();
  for (const cache of cacheFiles) {
    const stats = await fs.statSync(cache.localFilePath);
    tot_size += stats.size;
  }

  const fl1 = await prisma.path.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });
  const fl2 = await prisma.path.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
  const latestEntry = getTime(Date.now() - new Date(fl1.createdAt).getTime());
  const oldestEntry = getTime(Date.now() - new Date(fl2.createdAt).getTime());

  console.log(`Cache Stats`);
  console.log(`___________`);
  console.log(`Cached files ${tot_files}`);
  console.log(`Disk Usage ${tot_size}`);
  console.log(`Latest Entry ${latestEntry}`);
  console.log(`Oldest Entry ${oldestEntry}`);
};

export default cacheStats;
