"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opt) {}
export async function kylasPublicRoutes(fastify, opt) {
  fastify.post("/leads", {}, controller.create);
  fastify.post("/download-brochure", {}, controller.dowbloadBrochure);
}
