#!/usr/bin/env node
import startServer from "../server.js";
import { program } from "commander";
import cacheStats from "./commands/cache_stats.js";
import cacheClear from "./commands/cache_clear.js";
function isValidHttpsUrl(string) {
  if (!URL.canParse(string)) {
    return false;
  }
  return true;
}
program.version("1.0.0").description("My CLI");
program
  .command("start")
  .description("Start the proxy server")
  .requiredOption("-p, --port <port>", "Port to run the server on")
  .requiredOption(
    "-o, --origin <origin>",
    "Origin server to which requests will be forwarded to",
  )
  .action((options) => {
    // Validate the port number
    const port = parseInt(options.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error("Invalid port number");
      return;
    }

    try {
      const url = new URL(options.origin);

      if (url.protocol !== "https:") {
        console.error("Origin must use HTTPS");
        return;
      }
    } catch {
      console.error("Invalid origin URL");
      return;
    }

    startServer(options);
  });

program
  .command("cache-stats")
  .description("shows cached file stats")
  .action(async () => {
    await cacheStats();
  });

program
  .command("cache-clear")
  .description("clear cache locally and persistent db")
  .action(async () => {
    await cacheClear();
  });

program.parse(process.argv);
