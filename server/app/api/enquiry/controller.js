"use strict";
import { z } from "zod";
import table from "../../db/models.js";

const enquirySchema = z.object({
  vehicle_id: z.string({ required_error: "Vehicle id is required." }).uuid(),
  quantity: z
    .number({
      required_error: "Quantity is required.",
      invalid_type_error: "Quantity must be a number.",
    })
    .positive("Quantity must be positive."),
  name: z
    .string({ required_error: "Name is required." })
    .min(1, { message: "Name is required." }),
  email: z
    .string({ required_error: "Email is required." })
    .email()
    .min(1, { message: "Email is required." }),
  phone: z
    .string({ required_error: "Phone number is required." })
    .min(10, { message: "Invalid phone number." }),
  message: z
    .string()
    .max(500, "Details must not exceed 500 characters.")
    .optional(),
});

const create = async (req, res) => {
  try {
    const validateData = enquirySchema.parse(req.body);
    res.send({ status: true, data: await table.EnquiryModel.create(req) });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.EnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    res.send(record);
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.EnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    res.send(await table.EnquiryModel.deleteById(req));
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.EnquiryModel.get(req);
    res.send({ status: true, data: data, total: data?.[0]?.total });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  deleteById: deleteById,
  get: get,
};
