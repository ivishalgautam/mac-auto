"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["pdi", "pdi_incharge"]),
    },
    controller.create
  );
  fastify.get("/:id", {}, controller.getById);
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, [
          "pdi",
          "pdi_incharge",
          "image_urls",
          "invoice_urls",
        ]),
    },
    controller.update
  );
  fastify.delete("/:id", {}, controller.deleteById);
}
