import cluster from "node:cluster";
import os from "node:os";
import fastify from "fastify";
import config from "./app/config/index.js";
import logger from "./app/logger/index.js";
import server from "./server.js";

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork(); // auto-restart crashed worker
  });
} else {
  // Worker process
  const app = fastify({ logger: true });

  try {
    server(app);
  } catch (e) {
    console.error("Failed to register server:", e);
    logger.error(e);
    process.exit(1);
  }

  const start = async () => {
    try {
      await app.listen({ port: config.port, host: "0.0.0.0" });
      console.log(`🚀 Worker ${process.pid} listening on port ${config.port}`);
    } catch (e) {
      console.error(`Worker ${process.pid} failed to start:`, e);
      logger.error(e);
      process.exit(1);
    }
  };

  start();
}
