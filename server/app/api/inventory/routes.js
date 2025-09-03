"use strict";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.get("/", {}, controller.get);
  fastify.post("/:vehicle_id", {}, controller.create);
  fastify.get("/by-vehicle/:vehicle_id", {}, controller.getByVehicleId);
  fastify.get(
    "/by-vehicle-color/:vehicle_color_id",
    {},
    controller.getByVehicleColorId
  );
  fastify.put("/:id", {}, controller.update);
  fastify.get("/:id", {}, controller.getById);
}
