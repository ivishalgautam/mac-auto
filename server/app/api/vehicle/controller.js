"use strict";
import slugify from "slugify";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import { vehicleSchema } from "./schema.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  try {
    const validateData = vehicleSchema.parse(req.body);

    req.body.slug = slugify(validateData.title, {
      lower: true,
      strict: true,
      remove: /['"]/g,
    });

    await table.VehicleModel.create(req);
    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    const validateData = vehicleSchema.parse(req.body);
    req.body.slug = slugify(validateData.title, {
      lower: true,
      strict: true,
      remove: /['"]/g,
    });

    await table.VehicleModel.update(req);
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    await table.VehicleModel.deleteById(req);
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const record = await table.VehicleModel.get(req);
    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  getById: getById,
  get: get,
};
