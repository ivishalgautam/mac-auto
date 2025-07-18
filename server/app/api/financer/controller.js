"use strict";
import table from "../../db/models.js";
import { financerSchema } from "./schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import constants from "../../lib/constants/index.js";
import { sequelize } from "../../db/postgres.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const filePaths = req.filePaths;
  try {
    const validateData = financerSchema.parse(req.body);
    await table.FinancerModel.create(req);

    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    if (filePaths.length) {
      await cleanupFiles(filePaths);
    }
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.FinancerModel.getById(req);
    if (!record) return res.code(404).send({ message: "Financer not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  const filePaths = req.filePaths;
  const logo = req.body.logo_url ?? [];

  try {
    const record = await table.FinancerModel.getById(req);
    if (!record) return res.code(404).send({ message: "Financer not found!" });

    await table.FinancerModel.update(req, 0, transaction);

    if (!logo.length && record.logo.length) {
      await cleanupFiles(record.logo);
    }

    await transaction.commit();
    res.send({ status: true, message: "Updated" });
  } catch (error) {
    await transaction.rollback();
    if (filePaths.length) {
      await cleanupFiles(filePaths);
    }
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.FinancerModel.getById(req);
    if (!record) return res.code(404).send({ message: "Financer not found!" });

    res.send(await table.FinancerModel.deleteById(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.FinancerModel.get(req);
    res.send({ status: true, data: data, total: data?.[0]?.total });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  deleteById: deleteById,
  get: get,
  update: update,
};
