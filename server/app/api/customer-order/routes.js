"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post(
    "/",
    { preHandler: (req, res) => multipartPreHandler(req, res, []) },
    controller.create
  );
  fastify.put(
    "/:id",
    {
      preHandler: (req, res) =>
        multipartPreHandler(req, res, ["invoices_bills_urls"]),
    },
    controller.update
  );
}
