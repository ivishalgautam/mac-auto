"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post("/:id", {}, controller.create);
  fastify.get("/:id", {}, controller.getById);
  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);
}
