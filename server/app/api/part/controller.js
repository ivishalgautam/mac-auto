"use strict";
import table from "../../db/models.js";
import { partSchema } from "../../validation-schema/part-schema.js";

const create = async (req, res) => {
  try {
    const validateData = partSchema.parse(req.body);
    res.send(await table.PartModel.create(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.PartModel.getById(req);
    if (!record) return res.code(404).send({ message: "Part not found!" });

    res.send(record);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.PartModel.getById(req);
    if (!record) return res.code(404).send({ message: "Part not found!" });

    res.send(await table.PartModel.deleteById(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.PartModel.update(req);
    if (!record) return res.code(404).send({ message: "Part not found!" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.PartModel.get(req);
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
  update: update,
  get: get,
};
