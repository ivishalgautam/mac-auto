"use strict";
import { z } from "zod";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { convertToCustomerSchema, inquiryAssignToDealer } from "./schema.js";

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
    res.send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const convertToCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { role, id } = req.user_data;
  let dealerId = req.body?.dealer_id;

  try {
    const validateData = convertToCustomerSchema.parse(req.body);

    const record = await table.EnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    const user = await table.UserModel.create(
      {
        body: {
          username: validateData.username,
          password: validateData.password,
          first_name: record.name,
          email: record.email,
          mobile_number: record.phone,
          role: "customer",
        },
      },
      transaction
    );

    const customer = await table.CustomerModel.create(user.id, transaction);

    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      if (!record)
        return res
          .code(404)
          .send({ status: false, message: "Dealer not registered." });

      dealerId = dealerRecord.id;
    }

    await table.CustomerDealersModel.create(
      { body: { customer_id: customer.id, dealer_id: dealerId } },
      transaction
    );
    await table.EnquiryModel.update(
      { body: { status: "converted" } },
      record.id,
      transaction
    );

    await transaction.commit();
    res.code(200).send({ status: true, message: "Converted successfully." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const assignToDealer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validateData = inquiryAssignToDealer.parse(req.body);

    const record = await table.EnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    await table.EnquiryModel.update(
      {
        body: {
          status: "dealer assigned",
          dealer_id: validateData.dealer_id,
        },
      },
      record.id,
      transaction
    );

    await transaction.commit();
    res.code(200).send({ status: true, message: "Converted successfully." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  deleteById: deleteById,
  get: get,
  convertToCustomer: convertToCustomer,
  assignToDealer: assignToDealer,
};
