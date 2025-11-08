"use strict";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post("/", {}, controller.create);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id/items", {}, controller.getOrderItems);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
  fastify.put("/:id", {}, controller.update);
}
