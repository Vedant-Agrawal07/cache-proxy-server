import { createClient } from "redis";

export let isRedisConnect = false;
console.log("Connecting to Redis...");

const client = createClient({
  socket: { reconnectStrategy: () => false },
});
client.on("error", (err) => {
  // console.log("Redis Client Error", err);
  isRedisConnect = false;
});
try {
  await client.connect();
  isRedisConnect = true;
  console.log("Redis Connected. Running in FULL CACHE mode.");
} catch (error) {
  isRedisConnect = false;
   console.log("Redis unavailable.");
   console.log("Falling back to Disk Cache mode.");
   console.log("Proxy server will continue running.");
  // console.error("Reddis connection failed", error.message);
}

export default client;
