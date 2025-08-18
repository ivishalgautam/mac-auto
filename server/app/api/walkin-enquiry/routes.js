"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    { preHandler: (req, res) => multipartPreHandler(req, res, []) },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "pan_urls",
          "aadhaar_urls",
          "electricity_bill_urls",
          "rent_agreement_urls",
        ]),
    },
    controller.update
  );
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.post("/convert-to-customer/:id", {}, controller.convertToCustomer);
  fastify.post("/assign-to-dealer/:id", {}, controller.assignToDealer);
}

export async function walkinEnquiriesPublicRoutes(fastify, opt) {
  fastify.get("/:id", {}, controller.getById);
}
