"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import { schemeSchema } from "../../validation-schema/scheme.schema.js";

const create = async (req, res) => {
  const filePaths = req.file_paths;
  console.log({ filePaths });
  try {
    const validateData = schemeSchema.parse(req.body);
    res.send({ status: true, data: await table.SchemeModel.create(req) });
  } catch (error) {
    if (filePaths?.length) await cleanupFiles(filePaths);
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.SchemeModel.getById(req);
    if (!record) return res.code(404).send({ message: "Scheme not found!" });

    res.send({ statues: true, data: record });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.SchemeModel.getById(req);
    if (!record) return res.code(404).send({ message: "Scheme not found!" });

    await table.SchemeModel.deleteById(req, 0, transaction);

    await cleanupFiles(record?.file ?? []);

    await transaction.commit();
    res.send({ status: true, message: "Deleted" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.SchemeModel.getById(req);
    if (!record) return res.code(404).send({ message: "Scheme not found!" });

    await table.SchemeModel.update(req, 0, transaction);

    let documentsToDelete = [];
    const existingFile = record.file;
    const updatedFile = req.body.file_urls;
    if (updatedFile) {
      req.body.file = [...(req.body?.file ?? []), ...updatedFile];
      documentsToDelete.push(...getItemsToDelete(existingFile, updatedFile));
    }
    if (documentsToDelete.length) await cleanupFiles(documentsToDelete);

    await transaction.commit();
    res.send({ status: true, message: "Deleted" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.SchemeModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
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
