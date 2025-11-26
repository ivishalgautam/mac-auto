"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { createOrderSchema } from "../../validation-schema/order-schema.js";
import { StatusCodes } from "http-status-codes";
import { orderSchema } from "../../validation-schema/order.schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import { mailer } from "../../services/mailer.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validateData = createOrderSchema.parse(req.body);

    const { role, id } = req.user_data;
    let userRecord = null;
    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      req.body.dealer_id = dealerRecord.id;
      userRecord = req.user_data;
    } else {
      const dealerRecord = await table.DealerModel.getById(
        validateData.dealer_id
      );
      userRecord = await table.UserModel.getById(0, dealerRecord.user_id);
    }

    const orderRecord = await table.OrderModel.create(req, transaction);
    const itemRecords = await Promise.all(
      validateData.order_items.map(async (item) => {
        const vehicle = await table.VehicleModel.getById(0, item.vehicle_id);
        if (!vehicle) throw new Error(`Vehicle not found: ${item.vehicle_id}`);

        const colorEntries = item.colors || [];

        return {
          order_id: orderRecord.id,
          vehicle_id: item.vehicle_id,
          battery_type: item.battery_type,
          colors: colorEntries,
        };
      })
    );

    await table.OrderItemModel.bulkCreate(itemRecords, transaction);

    await transaction.commit();

    if (userRecord?.email) {
      await mailer.sendOrderCreatedEmail({
        email: userRecord.email,
        order_code: orderRecord.order_code,
        fullname: userRecord.first_name + " " + userRecord?.last_name ?? "",
        status: orderRecord.status,
      });
    }

    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Order created successfully" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.OrderModel.get(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validatedData = orderSchema.parse(req.body);

    const record = await table.OrderModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });
    }

    const dealerRecord = await table.DealerModel.getById(record.dealer_id);
    let userRecord = await table.UserModel.getById(0, dealerRecord.user_id);

    if (
      validatedData.status === "delivered" &&
      record.status !== "out for delivery"
    ) {
      return res.code(StatusCodes.NOT_FOUND).send({
        status: false,
        message: "Please add driver details and invoice details.",
      });
    }

    if (record.status === "delivered") {
      return res.code(StatusCodes.UNPROCESSABLE_ENTITY).send({
        status: false,
        message: "Can't update order. The order is already delivered.",
      });
    }

    const data = await table.OrderItemModel.getByOrderId(req);

    const documentsToDelete = [];

    const existingInvoiceDocs = record.invoice;
    const updatedInvoiceDocs = req.body.invoice_urls;
    if (updatedInvoiceDocs) {
      req.body.invoice = [...(req.body?.invoice ?? []), ...updatedInvoiceDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingInvoiceDocs, updatedInvoiceDocs)
      );
    }

    const existingPDIDocs = record.pdi;
    const updatedPDIDocs = req.body.pdi_urls;
    if (updatedPDIDocs) {
      req.body.pdi = [...(req.body?.pdi ?? []), ...updatedPDIDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingPDIDocs, updatedPDIDocs)
      );
    }

    const existingEWayBillDocs = record.e_way_bill;
    const updatedEWayBillDocs = req.body.e_way_bill_urls;
    if (updatedEWayBillDocs) {
      req.body.e_way_bill = [
        ...(req.body?.e_way_bill ?? []),
        ...updatedEWayBillDocs,
      ];
      documentsToDelete.push(
        ...getItemsToDelete(existingEWayBillDocs, updatedEWayBillDocs)
      );
    }

    const updated = await table.OrderModel.update(req, 0, transaction);

    if (updated.status === "delivered") {
      const chassisDetails = data.items
        .flatMap((item) =>
          item.colors.flatMap(
            (c) =>
              c.details &&
              c.details.map((detail) => ({
                ...detail,
                vehicle_id: item.vehicle_id,
                vehicle_color_id: c.vehicle_color_id,
              }))
          )
        )
        .filter(Boolean);

      const bulkAddData = chassisDetails.map((no) => ({
        vehicle_id: no.vehicle_id,
        vehicle_color_id: no.vehicle_color_id,
        dealer_id: record.dealer_id,
        motor_no: no.motor_no,
        battery_no: no.battery_no,
        charger_no: no.charger_no,
        chassis_no: no.chassis_no,
        controller_no: no.controller_no,
        status: "active",
      }));

      const newBulkData = await table.DealerInventoryModel.bulkCreate(
        bulkAddData,
        transaction
      );
    }

    await cleanupFiles(documentsToDelete);

    await transaction.commit();

    if (userRecord?.email) {
      await mailer.sendOrderStatusUpdateEmail({
        email: userRecord.email,
        order_code: record.order_code,
        fullname: userRecord.first_name + " " + userRecord?.last_name ?? "",
        status: record.status,
      });
    }

    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Order updated.", data: updated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    res.code(StatusCodes.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.deleteById(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Order deleted." });
  } catch (error) {
    throw error;
  }
};

const getOrderItems = async (req, res) => {
  try {
    const data = await table.OrderItemModel.getByOrderId(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const orderRecord = await table.OrderModel.getById(0, req.params.id);
    if (!orderRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    if (["out for delivery", "delivered"].includes(orderRecord.status)) {
      return res.code(StatusCodes.BAD_REQUEST).send({
        status: false,
        message: `Order is '${orderRecord?.status ?? ""}', No changes allowed!`,
      });
    }

    const record = await table.OrderItemModel.getById(0, req.params.item_id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order item not found." });

    const data = await table.OrderItemModel.update({
      body: req.body,
      params: { id: req.params.item_id },
    });
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const getOrderItem = async (req, res) => {
  try {
    const data = await table.OrderItemModel.getById(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  get: get,
  getOrderItems: getOrderItems,
  updateOrderItem: updateOrderItem,
  getOrderItem: getOrderItem,
  update: update,
  deleteById: deleteById,
  getById: getById,
};
