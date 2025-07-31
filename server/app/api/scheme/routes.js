"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    { preHandler: (req, res) => multipartPreHandler(req, res, ["is_active"]) },
    controller.create
  );
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["is_active", "file_url"]),
    },
    controller.update
  );
}
