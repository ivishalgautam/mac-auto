import fp from "fastify-plugin";
import pg_database from "../db/postgres.js";

export default fp(async (fastify) => {
  await fastify.register(pg_database, {});
});
