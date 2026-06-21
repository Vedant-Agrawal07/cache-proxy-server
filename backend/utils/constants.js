import path from "path";

export const CACHE_DIR = path.join(process.cwd(), "cache");

export const TTL = 24 * 60 * 60 * 1000;
