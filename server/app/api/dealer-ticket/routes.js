"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.put("/:id", {}, controller.update);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/:id/details", {}, controller.getDetailsById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
}

export async function ticketPublicRoutes(fastify, opt) {}
