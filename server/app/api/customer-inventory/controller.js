"use strict";
import table from "../../db/models.js";
import { customerInventorySchema } from "../../validation-schema/customer-inventory.schema.js";

const create = async (req, res) => {
  try {
    const validateData = customerInventorySchema.parse(req.body);
    res.send(await table.CustomerInventoryModel.create(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.CustomerInventoryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Inventory not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.CustomerInventoryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Inventory not found!" });

    await table.CustomerInventoryModel.update(req);

    res.send({ status: true, message: "Inventory updated." });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getByCustomer = async (req, res) => {
  try {
    const record = await table.CustomerModel.getById(req);
    if (!record) return res.code(404).send({ message: "Customer not found!" });

    const data = await table.CustomerInventoryModel.getByCustomer(req);

    res.send({ status: true, data: data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.CustomerInventoryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Inventory not found!" });

    res.send(await table.CustomerInventoryModel.deleteById(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.CustomerInventoryModel.get(req);
    res.send({ status: true, data: data, total: data?.[0]?.total });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  getByCustomer: getByCustomer,
  deleteById: deleteById,
  update: update,
  get: get,
};
