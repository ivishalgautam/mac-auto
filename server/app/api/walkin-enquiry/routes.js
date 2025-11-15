"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/my-enquiry",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "vehicle_ids",
          "references",
          "guarantor",
          "co_applicant",
        ]),
    },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "vehicle_ids",
          "references",
          "guarantor",
          "co_applicant",

          "pan_urls",
          "aadhaar_urls",
          "electricity_bill_urls",
          "rent_agreement_urls",
          "guarantor_aadhaar_urls",
        ]),
    },
    controller.update
  );
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.post("/assign-to-dealer/:id", {}, controller.assignToDealer);
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
}

export async function walkinEnquiriesPublicRoutes(fastify, opt) {
  fastify.get("/:id", {}, controller.getById);
  fastify.post("/", {}, controller.create);
}
