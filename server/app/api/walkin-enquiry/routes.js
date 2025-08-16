"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    { preHandler: (req, res) => multipartPreHandler(req, res, []) },
    controller.create
  );
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.post("/convert-to-customer/:id", {}, controller.convertToCustomer);
  fastify.post("/assign-to-dealer/:id", {}, controller.assignToDealer);
}

export async function enquiryPublicRoutes(fastify, opt) {}
