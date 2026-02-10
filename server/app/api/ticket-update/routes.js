"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/get-by-ticket/:id", {}, controller.getByTicket);
  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.post("/", {}, controller.create);
}
