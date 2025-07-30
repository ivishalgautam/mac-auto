"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post(
    "/",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "variants",
          "pricing",
          "emi_calculator",
          "vehicle_id",
          "chassis_numbers",
          "features",
          "specifications",
        ]),
    },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "pricing",
          "emi_calculator",
          "carousel_urls",
          "gallery_urls",
          "marketing_material_urls",
          "brochure_urls",
          "features",
          "specifications",
        ]),
    },
    controller.update
  );
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
}

export async function vehiclePublicRoutes(fastify, opts) {
  fastify.get("/", {}, controller.get);
  fastify.get("/get-by-slug/:slug", {}, controller.getBySlug);
}
