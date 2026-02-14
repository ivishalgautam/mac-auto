"use strict";
import fp from "fastify-plugin";
import Redis from "ioredis";
import config from "../config/index.js";

export default fp(async (fastify) => {
  const redis = new Redis({
    host: config.redis_host,
    port: Number(config.redis_port),
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null; // stop after 5 attempts
      return Math.min(times * 200, 3000);
    },
  });

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async () => {
    await redis.quit();
  });
});
