import expressAsyncHandler from "express-async-handler";
import {stats} from "../stats.js"
import prisma from "../db/db.js";
import fs from "fs";
import cacheClear from "../commands/cache_clear.js";

const adminStats = expressAsyncHandler(async(req,res)=>{
const cacheEntries = await prisma.path.count();
 let cacheSize = 0;
  const cacheFiles = await prisma.path.findMany();
  for (const cache of cacheFiles) {
    const stats = await fs.statSync(cache.localFilePath);
    cacheSize += stats.size;
  }
const hitRate = ((stats.cacheHits / stats.totalRequests)*100).toFixed(2);
    res.json({
      hitRate ,
      totalRequests : stats.totalRequests,
      cacheEntries,
      cacheSize,
      recentRequests:stats.recentRequests,
    });
});

const adminDelete = expressAsyncHandler(async(req , res)=>{
  try {
    await cacheClear();
  res.send("Purge Success"); 
  } catch (error) {
    console.error(error.message);
  }
})

export {adminStats , adminDelete};