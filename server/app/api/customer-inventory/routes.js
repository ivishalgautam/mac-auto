"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/:id", {}, controller.getById);
  fastify.put("/:id", {}, controller.update);
  fastify.get("/get-by-customer/:id", {}, controller.getByCustomer);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
}
