import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import constants from "../lib/constants/index.js";

export default fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: Number(constants.rateLimit.max_rate_limit),
    timeWindow: constants.rateLimit.time_window,
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `You have exceeded the ${context.max} requests in ${context.after} time window.`,
    }),
  });
});
