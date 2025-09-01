"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/my-enquiry", {}, controller.create);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.post(
    "/create-new-customer-order/:id",
    {},
    controller.createNewCustomerOrder
  );
  fastify.post(
    "/create-existing-customer-order/:id",
    {},
    controller.createExistingCustomerOrder
  );
  fastify.post("/assign-to-dealer/:id", {}, controller.assignToDealer); //walkin enquiry
}

export async function enquiryPublicRoutes(fastify, opt) {
  fastify.post("/", {}, controller.create);
}
