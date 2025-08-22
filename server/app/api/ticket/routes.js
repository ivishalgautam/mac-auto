"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["expected_closure_date", "parts"]),
    },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["expected_closure_date", "parts"]),
    },
    controller.update
  );
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/:id/details", {}, controller.getDetailsById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
}

export async function ticketPublicRoutes(fastify, opt) {}
