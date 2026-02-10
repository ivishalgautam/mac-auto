import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import vehicleRoutes from "../../api/vehicle/routes.js";
import inventoryRoutes from "../../api/inventory/routes.js";
import queryRoutes from "../../api/query/routes.js";
import enquiryRoutes from "../../api/enquiry/routes.js";
import dealerRoutes from "../../api/dealer/routes.js";
import financerRoutes from "../../api/financer/routes.js";
import dealerOrderRoutes from "../../api/dealer-order/routes.js";
import pdiChecksRoutes from "../../api/pdi-check/routes.js";
import vehicleEnquiryRoutes from "../../api/vehicle-enquiry/routes.js";
import customerRoutes from "../../api/customer/routes.js";
import followupRoutes from "../../api/followup/routes.js";
import schemeRoutes from "../../api/scheme/routes.js";
import customerOrderRoutes from "../../api/customer-order/routes.js";
import ticketRoutes from "../../api/ticket/routes.js";
import reportRoutes from "../../api/report/routes.js";
import vehicleColorRoutes from "../../api/vehicle-color/routes.js";
import walkinEnquiryRoutes from "../../api/walkin-enquiry/routes.js";
import dealerTicketRoutes from "../../api/dealer-ticket/routes.js";
import vehicleVariantRoutes from "../../api/vehicle-variant/routes.js";
import technicianRoutes from "../../api/technician/routes.js";
import quotationRoutes from "../../api/quotation/routes.js";
import invoiceRoutes from "../../api/invoices/routes.js";
import orderRoutes from "../../api/order/routes.js";
import partRoutes from "../../api/part/routes.js";
import ticketUpdateRoutes from "../../api/ticket-update/routes.js";

export default async function routes(fastify, options) {
  // middlewares
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });

  // routes
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(vehicleRoutes, { prefix: "vehicles" });
  fastify.register(inventoryRoutes, { prefix: "inventories" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(enquiryRoutes, { prefix: "enquiries" });
  fastify.register(dealerRoutes, { prefix: "dealers" });
  fastify.register(financerRoutes, { prefix: "financers" });
  fastify.register(dealerOrderRoutes, { prefix: "dealer-orders" });
  fastify.register(pdiChecksRoutes, { prefix: "pdi-checks" });
  fastify.register(vehicleEnquiryRoutes, { prefix: "vehicle-enquiries" });
  fastify.register(customerRoutes, { prefix: "customers" });
  fastify.register(followupRoutes, { prefix: "follow-ups" });
  fastify.register(schemeRoutes, { prefix: "schemes" });
  fastify.register(customerOrderRoutes, { prefix: "customer-orders" });
  fastify.register(ticketRoutes, { prefix: "tickets" });
  fastify.register(reportRoutes, { prefix: "reports" });
  fastify.register(vehicleColorRoutes, { prefix: "vehicle-colors" });
  fastify.register(walkinEnquiryRoutes, { prefix: "walkin-enquiries" });
  fastify.register(dealerTicketRoutes, { prefix: "dealer-tickets" });
  fastify.register(vehicleVariantRoutes, { prefix: "vehicle-variants" });
  fastify.register(technicianRoutes, { prefix: "technicians" });
  fastify.register(quotationRoutes, { prefix: "quotations" });
  fastify.register(invoiceRoutes, { prefix: "invoices" });
  fastify.register(orderRoutes, { prefix: "orders" });
  fastify.register(partRoutes, { prefix: "parts" });
  fastify.register(ticketUpdateRoutes, { prefix: "ticket-updates" });
}
