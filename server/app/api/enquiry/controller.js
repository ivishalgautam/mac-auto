"use strict";
import { z } from "zod";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import {
  createNewCustomerOrderSchema,
  inquiryAssignToDealer,
} from "./schema.js";
import { isValidPhoneNumber } from "libphonenumber-js";
import { StatusCodes } from "http-status-codes";

const enquirySchema = z
  .object({
    vehicle_id: z.string().min(1, "Vehicle ID is required").trim(),

    quantity: z
      .number()
      .min(0, "Quantity must be at least 1")
      .max(100, "Quantity cannot exceed 100")
      .int("Quantity must be a whole number")
      .optional(),

    message: z
      .string()
      .max(1000, "Message cannot exceed 1000 characters")
      .optional()
      .or(z.literal("")),

    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .trim(),

    email: z.preprocess((val) => {
      if (val === null || val === undefined || val === "") return null;
      if (typeof val === "string") return val.trim().toLowerCase();
      return val;
    }, z.string().email("Please enter a valid email address").nullable().optional()),

    phone: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),

    location: z
      .string()
      .max(100, "Location cannot exceed 100 characters")
      .trim()
      .optional(),
  })
  .refine((data) => isValidPhoneNumber(data.phone), {
    path: ["phone"],
    message: "Invalid phone number",
  });

const create = async (req, res) => {
  try {
    const validateData = enquirySchema.parse(req.body);

    const { role, id } = req.user_data;
    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      if (!dealerRecord)
        return res
          .code(404)
          .send({ status: false, message: "Dealer not found." });

      req.body.dealer_id = dealerRecord.id;
    }

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

const createNewCustomerOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { role, id } = req.user_data;
  let dealerId = req.body?.dealer_id;

  try {
    const validateData = createNewCustomerOrderSchema.parse(req.body);
    const record = await table.EnquiryModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Enquiry not found!" });

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

const createExistingCustomerOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { role, id } = req.user_data;
  let dealerId = req.body?.dealer_id;

  try {
    const record = await table.EnquiryModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Enquiry not found!" });

    const user = await table.UserModel.getByPhone(record.phone);
    if (!user || (user && user.role !== "customer"))
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "User not found" });

    const customer = await table.CustomerModel.create(user.id, transaction);

    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      if (!record)
        return res
          .code(StatusCodes.NOT_FOUND)
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
  createNewCustomerOrder: createNewCustomerOrder,
  createExistingCustomerOrder: createExistingCustomerOrder,
  assignToDealer: assignToDealer,
};
