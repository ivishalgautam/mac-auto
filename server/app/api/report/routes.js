"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opt) {
  fastify.get("/", {}, controller.reports);
}
