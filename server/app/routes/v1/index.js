import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import bannerRoutes from "../../api/banner/routes.js";
import vehicleRoutes from "../../api/vehicle/routes.js";
import inventoryRoutes from "../../api/inventory/routes.js";
import queryRoutes from "../../api/query/routes.js";
import enquiryRoutes from "../../api/enquiry/routes.js";
import dealerRoutes from "../../api/dealer/routes.js";
import financerRoutes from "../../api/financer/routes.js";
import dealerOrderRoutes from "../../api/dealer-order/routes.js";

export default async function routes(fastify, options) {
  // middlewares
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });

  // routes
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(bannerRoutes, { prefix: "banners" });
  fastify.register(vehicleRoutes, { prefix: "vehicles" });
  fastify.register(inventoryRoutes, { prefix: "inventories" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(enquiryRoutes, { prefix: "enquiries" });
  fastify.register(dealerRoutes, { prefix: "dealers" });
  fastify.register(financerRoutes, { prefix: "financers" });
  fastify.register(dealerOrderRoutes, { prefix: "dealer-orders" });
}
