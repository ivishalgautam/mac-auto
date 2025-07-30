"use strict";
import { vehiclePublicRoutes } from "../../api/vehicle/routes.js";
import { financerPublicRoutes } from "../../api/financer/routes.js";
import { enquiryPublicRoutes } from "../../api/enquiry/routes.js";

export default async function routes(fastify, options) {
  fastify.register(vehiclePublicRoutes, { prefix: "vehicles" });
  fastify.register(financerPublicRoutes, { prefix: "financers" });
  fastify.register(enquiryPublicRoutes, { prefix: "enquiries" });
}
