"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["interest_percentage", "area_serve"]),
    },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "interest_percentage",
          "area_serve",
          "logo_url",
        ]),
    },
    controller.update
  );
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
}

export async function financerPublicRoutes(fastify, opt) {
  fastify.get("/", {}, controller.get);
}
