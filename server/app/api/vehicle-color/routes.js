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
}
