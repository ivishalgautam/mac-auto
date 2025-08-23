"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opt) {
  fastify.post(
    "/",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["chassis_numbers"]),
    },
    controller.create
  );
  fastify.get("/:id", {}, controller.getById);
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "chassis_numbers",
          "carousel_urls",
          "gallery_urls",
        ]),
    },
    controller.update
  );
  fastify.delete("/:id", {}, controller.deleteById);
}

export async function vehicleColorPublicRoutes(fastify, opts) {
  fastify.get("/import", {}, controller.importVehicles);
}
