import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import vehicleRoutes from "../../api/vehicle/routes.js";
import inventoryRoutes from "../../api/inventory/routes.js";
import queryRoutes from "../../api/query/routes.js";
import enquiryRoutes from "../../api/enquiry/routes.js";
import dealerRoutes from "../../api/dealer/routes.js";
import financerRoutes from "../../api/financer/routes.js";
import dealerOrderRoutes from "../../api/dealer-order/routes.js";
import pdiChecksRoutes from "../../api/pdi-check/routes.js";
import vehicleEnquiryRoutes from "../../api/vehicle-enquiry/routes.js";
import customerRoutes from "../../api/customer/routes.js";
import followupRoutes from "../../api/followup/routes.js";
import schemeRoutes from "../../api/scheme/routes.js";
import customerOrderRoutes from "../../api/customer-order/routes.js";
import ticketRoutes from "../../api/ticket/routes.js";
import reportRoutes from "../../api/report/routes.js";
import vehicleColorRoutes from "../../api/vehicle-color/routes.js";

export default async function routes(fastify, options) {
  // middlewares
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });

  // routes
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(vehicleRoutes, { prefix: "vehicles" });
  fastify.register(inventoryRoutes, { prefix: "inventories" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(enquiryRoutes, { prefix: "enquiries" });
  fastify.register(dealerRoutes, { prefix: "dealers" });
  fastify.register(financerRoutes, { prefix: "financers" });
  fastify.register(dealerOrderRoutes, { prefix: "dealer-orders" });
  fastify.register(pdiChecksRoutes, { prefix: "pdi-checks" });
  fastify.register(vehicleEnquiryRoutes, { prefix: "vehicle-enquiries" });
  fastify.register(customerRoutes, { prefix: "customers" });
  fastify.register(followupRoutes, { prefix: "follow-ups" });
  fastify.register(schemeRoutes, { prefix: "schemes" });
  fastify.register(customerOrderRoutes, { prefix: "customer-orders" });
  fastify.register(ticketRoutes, { prefix: "tickets" });
  fastify.register(reportRoutes, { prefix: "reports" });
  fastify.register(vehicleColorRoutes, { prefix: "vehicle-colors" });
}
