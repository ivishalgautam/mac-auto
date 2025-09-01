"use strict";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import { technicianSchema } from "./schema.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

export const create = async (req, res) => {
  try {
    let data;

    const validateData = technicianSchema.parse(req.body);
    data = await table.TechnicianModel.create({ body: validateData });

    return res
      .code(StatusCodes.CREATED)
      .send({ success: true, message: ReasonPhrases.CREATED, data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TechnicianModel.getById(req);
    if (!record)
      return res.code(status.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });

    await table.TechnicianModel.deleteById(req);
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.TechnicianModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    await table.TechnicianModel.update(req);

    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.TechnicianModel.get(req);

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};
const getById = async (req, res) => {
  try {
    const record = await table.TechnicianModel.getById(req);
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
