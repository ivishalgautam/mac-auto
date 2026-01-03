"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { invoiceSchema } from "../../validation-schema/invoice-schema.js";
import { sequelize } from "../../db/postgres.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validatedData = invoiceSchema.parse(req.body);

    if (req.user_data.role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(
        req.user_data.id
      );
      if (!dealerRecord)
        return res
          .code(StatusCodes.NOT_FOUND)
          .send({ status: false, message: "Dealer not registered." });

      req.body.dealer_id = dealerRecord.id;
    }

    const customerPurchaseList = [];
    const inventoryIdsToBeSold = [];

    for await (const dealerVehicleInventoryId of validatedData.vehicle_ids) {
      const inventoryRecord = await table.DealerInventoryModel.getById(
        dealerVehicleInventoryId
      );
      if (!inventoryRecord) continue;

      await table.DealerInventoryModel.update(
        { body: { status: "sold" } },
        inventoryRecord.id,
        transaction
      );

      inventoryIdsToBeSold.push(inventoryRecord.vehicle_id);
      customerPurchaseList.push({
        vehicle_id: inventoryRecord.vehicle_id,
        vehicle_color_id: inventoryRecord.vehicle_color_id,
        customer_id: validatedData.customer_id,
        dealer_id: inventoryRecord.dealer_id,
        chassis_no: inventoryRecord.chassis_no,
      });
    }

    const invoice = await table.InvoiceModel.create(req, transaction);
    await table.CustomerPurchaseModel.bulkCreate(
      customerPurchaseList,
      transaction
    );
    await table.DealerInventoryModel.bulkUpdateStatus(
      inventoryIdsToBeSold,
      "sold",
      transaction
    );

    // throw new Error("Error");
    await transaction.commit();
    res
      .code(StatusCodes.CREATED)
      .send({ status: true, data: invoice, message: "invoice created." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.InvoiceModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "invoice not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.InvoiceModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "invoice not found!" });

    await table.InvoiceModel.update(req, req.params.id);
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "invoice updated successfully." });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.InvoiceModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Invoice not found!" });

    await table.InvoiceModel.deleteById(req.params.id);
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Invoice deleted successfully." });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.InvoiceModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  update: update,
  deleteById: deleteById,
  get: get,
};
