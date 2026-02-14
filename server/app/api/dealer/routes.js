"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post(
    "/import",
    { preHandler: (req, res) => multipartPreHandler(req, res, []) },
    controller.importDealers
  );
  fastify.post("/inventory", {}, controller.createInventory);
  fastify.get("/inventory", {}, controller.getDealerInventory);
  fastify.get(
    "/inventory/get-formatted-available-vehicles",
    {},
    controller.getFormattedAvailableVehicles
  );
  fastify.get("/inventory/chassis", {}, controller.getChassis);
  fastify.get("/inventory/:id", {}, controller.getInventoryItemById);
  fastify.put("/inventory/:id", {}, controller.updateDealerInventory);
  fastify.get(
    "/inventory/by-vehicle/:vehicle_id",
    {},
    controller.getInventoryByVehicleId
  );
  fastify.get(
    "/inventory/by-vehicle-color/:vehicle_color_id",
    {},
    controller.getInventoryByVehicleColorId
  );
  fastify.get(
    "/inventory/by-vehicle/:vehicle_id/colors",
    {},
    controller.getColors
  );
  fastify.get(
    "/inventory/by-vehicle/:vehicle_id/variants",
    {},
    controller.getVariants
  );
}

export async function dealerPublicRoutes(fastify, opt) {
  fastify.get("/", {}, controller.get);
}
