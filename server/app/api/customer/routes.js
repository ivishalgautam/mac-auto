"use strict";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.post("/assign-to-dealer", {}, controller.assignToDealer);
  fastify.get("/dealer-customers", {}, controller.getDealerCustomers);
  fastify.get("/create-purchase", {}, controller.getDealerCustomers);
  fastify.get("/purchases", {}, controller.getCustomerPurchases);
}
