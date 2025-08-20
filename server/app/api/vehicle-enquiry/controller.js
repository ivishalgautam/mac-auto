"use strict";
import { z } from "zod";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;

const enquirySchema = z.object({
  vehicle_id: z.string({ required_error: "Vehicle id is required." }).uuid(),
  quantity: z
    .number({
      required_error: "Quantity is required.",
      invalid_type_error: "Quantity must be a number.",
    })
    .positive("Quantity must be positive."),
  message: z
    .string()
    .max(500, "Details must not exceed 500 characters.")
    .optional(),
});

const create = async (req, res) => {
  try {
    const validateData = enquirySchema.parse(req.body);
    const dealerRecord = await table.DealerModel.getByUserId(req.user_data.id);
    if (!dealerRecord)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Dealer not registered." });

    req.body.dealer_id = dealerRecord.id;

    await table.VehicleEnquiryModel.create(req);

    res.code(status.CREATED).send({ status: true, data: "Enquiry added" });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.VehicleEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    res.send(record);
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.VehicleEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    await table.VehicleEnquiryModel.deleteById(req);

    res
      .code(status.OK)
      .send({ status: true, message: "Deleted successfully." });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.VehicleEnquiryModel.get(req);
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
