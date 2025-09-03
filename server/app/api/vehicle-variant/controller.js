"use strict";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import {
  bulkVehicleVariantSchema,
  singleVehicleVariantSchema,
} from "./schema.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

export const create = async (req, res) => {
  try {
    let data;

    if (req.body?.variant_names && Array.isArray(req.body.variant_names)) {
      const validateData = bulkVehicleVariantSchema.parse(req.body);
      data = await table.VehicleVariantModel.bulkCreate(
        validateData.variant_names
      );
    } else {
      const validateData = singleVehicleVariantSchema.parse(req.body);
      data = await table.VehicleVariantModel.create({ body: validateData });
    }

    return res
      .code(StatusCodes.CREATED)
      .send({ success: true, message: ReasonPhrases.CREATED, data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.VehicleVariantModel.getById(req);
    if (!record)
      return res.code(status.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });

    await table.VehicleVariantModel.deleteById(req);
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.VehicleVariantModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    await table.VehicleVariantModel.update(req);

    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.VehicleVariantModel.get(req);

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};
const getById = async (req, res) => {
  try {
    const record = await table.VehicleVariantModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  deleteById: deleteById,
  update: update,
  get: get,
  getById: getById,
};
