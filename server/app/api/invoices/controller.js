"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { quotationSchema } from "../../validation-schema/quotation.schema.js";

const create = async (req, res) => {
  try {
    const validatedData = quotationSchema.parse(req.body);

    const vehicle = await table.VehicleModel.getById(
      0,
      validatedData.vehicle_id
    );
    if (!vehicle) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Vehicle not registered." });
    } else {
      req.body.model = vehicle.title;
    }

    const vehicleVariantMap = await table.VehicleVariantMapModel.getById(
      0,
      validatedData.vehicle_variant_map_id
    );
    if (!vehicleVariantMap) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Vehicle variant not found." });
    } else {
      const vehicleVariant = await table.VehicleVariantModel.getById(
        0,
        vehicleVariantMap.vehicle_variant_id
      );
      req.body.variant = vehicleVariant.variant_name;
    }

    const vehicleColor = await table.VehicleColorModel.getById(
      0,
      validatedData.vehicle_color_id
    );
    if (!vehicleColor) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Vehicle color not found." });
    } else {
      req.body.color = vehicleColor.color_name;
    }

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
        .send({ message: "invoice not found!" });

    await table.InvoiceModel.deleteById(req.params.id);
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "invoice deleted successfully." });
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
