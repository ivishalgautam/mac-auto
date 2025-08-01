"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post("/", {}, controller.create);
  fastify.get("/", {}, controller.get);
  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/chassis-details/:id", {}, controller.getChassisDetailsOfOrder);
}
