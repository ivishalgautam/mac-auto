"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.get("/", {}, controller.get);
  fastify.post("/inventory", {}, controller.createInventory);
  fastify.get("/inventory", {}, controller.getDealerInventory);
}
