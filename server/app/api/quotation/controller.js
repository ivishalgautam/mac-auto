"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { quotationSchema } from "../../validation-schema/quotation.schema.js";
import { sequelize } from "../../db/postgres.js";

const create = async (req, res) => {
  try {
    const validatedData = quotationSchema.parse(req.body);

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

    const dealer = await table.DealerModel.getByUserId(req.user_data.id);
    req.body.dealer_code = dealer.dealer_code;

    const quotation = await table.QuotationModel.create(req);
    res
      .code(StatusCodes.CREATED)
      .send({ status: true, data: quotation, message: "Quotation created." });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.QuotationModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Quotation not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.QuotationModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Quotation not found!" });

    await table.QuotationModel.update(req, req.params.id);
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Quotation updated successfully." });
  } catch (error) {
    throw error;
  }
};

const convertToInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.QuotationModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Quotation not found!" });

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

    const dealer = await table.DealerModel.getByUserId(req.user_data.id);

    await table.InvoiceModel.create(
      { body: { ...record, dealer_code: dealer?.dealer_code } },
      transaction
    );
    await table.QuotationModel.update(
      { body: { status: "invoice-generated" } },
      req.params.id,
      transaction
    );

    await transaction.commit();
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Quotation updated successfully." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.QuotationModel.getById(req.params.id);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Quotation not found!" });

    await table.QuotationModel.deleteById(req.params.id);
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Quotation deleted successfully." });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.QuotationModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  convertToInvoice: convertToInvoice,
  update: update,
  deleteById: deleteById,
  get: get,
};
