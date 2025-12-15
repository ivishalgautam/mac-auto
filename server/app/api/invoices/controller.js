"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { invoiceSchema } from "../../validation-schema/invoice-schema.js";

const create = async (req, res) => {
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

    const quotation = await table.InvoiceModel.create(req);
    res
      .code(StatusCodes.CREATED)
      .send({ status: true, data: quotation, message: "invoice created." });
  } catch (error) {
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
