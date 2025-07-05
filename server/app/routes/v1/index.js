import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import bannerRoutes from "../../api/banner/routes.js";
import vehicleRoutes from "../../api/vehicle/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(bannerRoutes, { prefix: "banners" });
  fastify.register(vehicleRoutes, { prefix: "vehicles" });
}
