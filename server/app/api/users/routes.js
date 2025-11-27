"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      preHandler: async (req, res) =>
        multipartPreHandler(req, res, ["aadhaar_urls", "pan_urls", "gst_urls"]),
    },
    controller.create
  );
  fastify.post("/:id/change-password", {}, controller.updatePassword);
  fastify.put(
    "/:id",
    {
      preHandler: async (req, res) =>
        multipartPreHandler(req, res, ["aadhaar_urls", "pan_urls", "gst_urls"]),
    },
    controller.update
  );
  fastify.get("/me", {}, controller.getUser);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/by-phone/:phone", {}, controller.getByPhone);
  fastify.delete("/:id", {}, controller.deleteById);
}
