"use strict";
import { vehiclePublicRoutes } from "../../api/vehicle/routes.js";
import { financerPublicRoutes } from "../../api/financer/routes.js";
import { enquiryPublicRoutes } from "../../api/enquiry/routes.js";
import { walkinEnquiriesPublicRoutes } from "../../api/walkin-enquiry/routes.js";
import { kylasPublicRoutes } from "../../api/kylas/routes.js";
import { vehicleColorPublicRoutes } from "../../api/vehicle-color/routes.js";
import { queryPublicRoutes } from "../../api/query/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });
  fastify.register(vehiclePublicRoutes, { prefix: "vehicles" });
  fastify.register(financerPublicRoutes, { prefix: "financers" });
  fastify.register(enquiryPublicRoutes, { prefix: "enquiries" });
  fastify.register(queryPublicRoutes, { prefix: "queries" });
  fastify.register(walkinEnquiriesPublicRoutes, { prefix: "walkin-enquiries" });
  fastify.register(vehicleColorPublicRoutes, { prefix: "vehicle-colors" });

  fastify.register(kylasPublicRoutes, { prefix: "kylas" });
}
