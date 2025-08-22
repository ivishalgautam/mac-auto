"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.get("/", {}, controller.get);
  fastify.post("/inventory", {}, controller.createInventory);
  fastify.get("/inventory", {}, controller.getDealerInventory);
  fastify.get("/inventory/:id", {}, controller.getInventoryItemById);
  fastify.put("/inventory/:id", {}, controller.updateDealerInventory);
  fastify.get(
    "/inventory/by-vehicle/:vehicle_id",
    {},
    controller.getInventoryByVehicleId
  );
  fastify.get(
    "/inventory/by-vehicle-color/:vehicle_id",
    {},
    controller.getInventoryByVehicleId
  );
  fastify.get(
    "/inventory/by-vehicle/:vehicle_id/colors",
    {},
    controller.getColors
  );
}
