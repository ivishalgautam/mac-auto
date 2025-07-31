"use strict";
import { z } from "zod";
import table from "../../db/models.js";

const schema = z.object({
  enquiry_id: z.string({ required_error: "Enquiry id is required." }).uuid(),
  message: z
    .string()
    .max(500, "Details must not exceed 500 characters.")
    .optional(),
});

const create = async (req, res) => {
  try {
    const validateData = schema.parse(req.body);
    res.send({ status: true, data: await table.FollowupModel.create(req) });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.FollowupModel.getById(req);
    if (!record) return res.code(404).send({ message: "Follow up not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.FollowupModel.getById(req);
    if (!record) return res.code(404).send({ message: "Follow up not found!" });

    res.send(await table.FollowupModel.deleteById(req));
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.FollowupModel.getById(req);
    if (!record) return res.code(404).send({ message: "Follow up not found!" });

    res.send({ status: true, data: await table.FollowupModel.update(req) });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.FollowupModel.get(req);
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
