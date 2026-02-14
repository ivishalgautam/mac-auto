import fp from "fastify-plugin";
import formbody from "@fastify/formbody";

export default fp(async (fastify) => {
  await fastify.register(formbody);
});
