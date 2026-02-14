import fp from "fastify-plugin";
import cors from "@fastify/cors";
import config from "../config/index.js";
import constants from "../lib/constants/index.js";

export default fp(async (fastify) => {
  return fastify.register(cors, {
    origin: constants.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
