import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import banners from "../../api/banner/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(banners, { prefix: "banners" });
}
