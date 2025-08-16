"use strict";
import { z } from "zod";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { convertToCustomerSchema, inquiryAssignToDealer } from "./schema.js";
import { isValidPhoneNumber } from "libphonenumber-js";

export const walkInEnquirySchema = z
  .object({
    vehicle_id: z.string().min(1, "Vehicle ID is required").trim(),
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .trim(),
    phone: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),
    location: z
      .string()
      .min(1, "Location is required")
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location cannot exceed 100 characters")
      .trim(),
    purchase_type: z.enum(["finance", "cash"], {
      message: "Purchase type is required",
    }),
    pan: z.array(z.any()).optional().or(z.literal(undefined)),
    aadhaar: z.array(z.any()).optional().or(z.literal(undefined)),
    electricity_bill: z.array(z.any()).optional().or(z.literal(undefined)),
    rent_agreement: z.array(z.any()).optional().or(z.literal(undefined)),
  })
  .refine((data) => isValidPhoneNumber(data.phone), {
    path: ["phone"],
    message: "Invalid phone number",
  })
  .superRefine((data, ctx) => {
    if (data.purchase_type === "finance") {
      if (!data.pan || data.pan.length === 0) {
        ctx.addIssue({
          path: ["pan"],
          code: z.ZodIssueCode.custom,
          message: "PAN is required*",
        });
      }
      if (!data.aadhaar || data.aadhaar.length === 0) {
        ctx.addIssue({
          path: ["aadhaar"],
          code: z.ZodIssueCode.custom,
          message: "Aadhaar is required*",
        });
      }
      if (!data.electricity_bill || data.electricity_bill.length === 0) {
        ctx.addIssue({
          path: ["electricity_bill"],
          code: z.ZodIssueCode.custom,
          message: "Electricity bill is required*",
        });
      }
      if (!data.rent_agreement || data.rent_agreement.length === 0) {
        ctx.addIssue({
          path: ["rent_agreement"],
          code: z.ZodIssueCode.custom,
          message: "Rent agreement is required*",
        });
      }
    }
  });

// Optional: Create a type from the schema for TypeScript

const create = async (req, res) => {
  try {
    const validateData = walkInEnquirySchema.parse(req.body);
    res.send({
      status: true,
      data: await table.WalkinEnquiryModel.create(req),
    });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    res.send(record);
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    res.send(await table.WalkinEnquiryModel.deleteById(req));
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.WalkinEnquiryModel.get(req);
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

    const record = await table.WalkinEnquiryModel.getById(req);
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
    await table.WalkinEnquiryModel.update(
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

    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    await table.WalkinEnquiryModel.update(
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
