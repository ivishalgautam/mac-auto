import config from "./app/config/index.js";
import logger from "./app/logger/index.js";
import server from "./server.js";
import fastify from "fastify";

const app = fastify({ logger: true });
// const app = fastify({ logger: logger });

try {
  server(app);
} catch (e) {
  // console.error(e);
  logger.error(e);
  process.exit(1);
}

/**
 * Run the server!
 */
const start = async () => {
  try {
    await app.listen({ port: config.port }); // For fastify server
  } catch (e) {
    // app.log.error(e);
    logger.error(e);
    process.exit(1);
  }
};

start();
