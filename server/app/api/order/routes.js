"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post("/", {}, controller.create);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id/items", {}, controller.getOrderItems);
  fastify.put("/:id/items/:item_id", {}, controller.updateOrderItem);
  fastify.get("/items/:id", {}, controller.getOrderItem);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
  fastify.put(
    "/:id",
    {
      preHandler: async (req, res) =>
        multipartPreHandler(req, res, [
          "driver_details",
          "invoice_urls",
          "pdi_urls",
          "e_way_bill_urls",
        ]),
    },
    controller.update
  );
}
