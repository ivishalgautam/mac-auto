"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import {
  convertToCustomerSchema,
  inquiryAssignToDealer,
  walkInEnquirySchema,
} from "./schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import { createNewCustomerOrderSchema } from "../enquiry/schema.js";
import { StatusCodes } from "http-status-codes";

const create = async (req, res) => {
  try {
    const { role, id } = req.user_data;
    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      console.log({ dealerRecord });
      if (!dealerRecord)
        return res
          .code(404)
          .send({ status: false, message: "Dealer not found." });

      req.body.dealer_id = dealerRecord.id;
    }

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

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    const documentsToDelete = [];
    const existingPanDocs = record.pan;
    const updatedPanDocs = req.body.pan_urls;
    if (updatedPanDocs) {
      req.body.pan = [...(req.body?.pan ?? []), ...updatedPanDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingPanDocs, updatedPanDocs)
      );
    }

    const existingAadhaarDocs = record.aadhaar;
    const updatedAadhaarDocs = req.body.aadhaar_urls;
    if (updatedAadhaarDocs) {
      req.body.aadhaar = [...(req.body?.aadhaar ?? []), ...updatedAadhaarDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingAadhaarDocs, updatedAadhaarDocs)
      );
    }

    const existingEBillDocs = record.electricity_bill;
    const updatedEBillDocs = req.body.electricity_bill_urls;
    if (updatedEBillDocs) {
      req.body.electricity_bill = [
        ...(req.body?.electricity_bill ?? []),
        ...updatedEBillDocs,
      ];
      documentsToDelete.push(
        ...getItemsToDelete(existingEBillDocs, updatedEBillDocs)
      );
    }

    const existingRentAgreementDocs = record.rent_agreement;
    const updatedRentAgreementDocs = req.body.rent_agreement_urls;
    if (updatedRentAgreementDocs) {
      req.body.rent_agreement = [
        ...(req.body?.rent_agreement ?? []),
        ...updatedRentAgreementDocs,
      ];
      documentsToDelete.push(
        ...getItemsToDelete(existingRentAgreementDocs, updatedRentAgreementDocs)
      );
    }

    const existingGuarantorAadhaarDocs = record.guarantor_aadhaar;
    const updatedGuarantorAadhaarDocs = req.body.guarantor_aadhaar_urls;
    if (updatedGuarantorAadhaarDocs) {
      req.body.guarantor_aadhaar = [
        ...(req.body?.guarantor_aadhaar ?? []),
        ...updatedGuarantorAadhaarDocs,
      ];
      documentsToDelete.push(
        ...getItemsToDelete(
          existingGuarantorAadhaarDocs,
          updatedGuarantorAadhaarDocs
        )
      );
    }

    if (documentsToDelete.length) await cleanupFiles(documentsToDelete);

    await table.WalkinEnquiryModel.update(req, 0, transaction);

    await transaction.commit();
    res.send({ status: true, message: "Updated" });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    if (req.filePaths) await cleanupFiles(req.filePaths);
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record) return res.code(404).send({ message: "Enquiry not found!" });

    const data = await table.WalkinEnquiryModel.deleteById(req, 0, transaction);

    const filesToDelete = [
      ...(record?.pan ?? []),
      ...(record?.aadhaar ?? []),
      ...(record?.electricity_bill ?? []),
      ...(record?.rent_agreement ?? []),
    ];
    await cleanupFiles(filesToDelete);
    await transaction.commit();
    res.send({ status: true, message: "Deleted" });
  } catch (error) {
    await transaction.rollback();
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

const createNewCustomerOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { role, id } = req.user_data;
  let dealerId = req.body?.dealer_id;

  try {
    const validateData = createNewCustomerOrderSchema.parse(req.body);
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Enquiry not found!" });

    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      if (!record)
        return res
          .code(404)
          .send({ status: false, message: "Dealer not registered." });

      dealerId = dealerRecord.id;
    }

    const user = await table.UserModel.create(
      {
        body: {
          username: validateData.username,
          password: validateData.password,
          first_name: record.name,
          email: record.email,
          mobile_number: validateData.mobile_number ?? record.phone,
          role: "customer",
        },
      },
      transaction
    );

    const customerRecord = await table.CustomerModel.create(
      user.id,
      transaction
    );

    const chassisRecord =
      await table.DealerInventoryModel.getByChassisAndDealer(
        req.body.chassis_no,
        dealerId
      );
    if (!chassisRecord) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Chassis not found!" });
    }

    // add customer dealer map entry
    await table.CustomerDealersModel.create(
      { body: { customer_id: customerRecord.id, dealer_id: dealerId } },
      transaction
    );

    // update enquiry status
    await table.WalkinEnquiryModel.update(
      { body: { status: "converted" } },
      record.id,
      transaction
    );

    // add entry to customer purchase
    await table.CustomerPurchaseModel.create(
      {
        body: {
          vehicle_id: chassisRecord.vehicle_id,
          vehicle_color_id: req.body.vehicle_color_id,
          customer_id: customerRecord.id,
          dealer_id: dealerId,
          chassis_no: req.body.chassis_no,
          invoices_bills: req.body.invoices_bills,
          booking_amount: req.body.booking_amount,
        },
      },
      transaction
    );

    // dealer inventory chassis update
    await table.DealerInventoryModel.updateStatusByChassisNo(
      req.body.chassis_no,
      "sold",
      transaction
    );

    await transaction.commit();
    res.code(200).send({ status: true, message: "Created successfully." });
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
    const record = await table.WalkinEnquiryModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Enquiry not found!" });

    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      if (!record)
        return res
          .code(StatusCodes.NOT_FOUND)
          .send({ status: false, message: "Dealer not registered." });

      dealerId = dealerRecord.id;
    }

    const user = await table.UserModel.getByPhone(record.phone);
    if (!user || (user && user.role !== "customer")) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "User not found" });
    }

    const customerRecord = await table.CustomerModel.getByUserId(0, user.id);
    if (!customerRecord) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Customer not found" });
    }

    const chassisRecord =
      await table.DealerInventoryModel.getByChassisAndDealer(
        req.body.chassis_no,
        dealerId
      );
    if (!chassisRecord) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Chassis not found!" });
    }

    const dealerCustomerRecord =
      await table.CustomerDealersModel.getByCustomerAndDealer({
        body: { customer_id: customerRecord.id, dealer_id: dealerId },
      });

    if (!dealerCustomerRecord) {
      // create customer dealer entry
      await table.CustomerDealersModel.create(
        { body: { customer_id: customerRecord.id, dealer_id: dealerId } },
        transaction
      );
    }

    // update enquiry
    await table.WalkinEnquiryModel.update(
      { body: { status: "converted" } },
      record.id,
      transaction
    );

    // update dealer inventory chassis status
    await table.DealerInventoryModel.updateStatusByChassisNo(
      req.body.chassis_no,
      "sold",
      transaction
    );

    // add entry to customer purchase
    await table.CustomerPurchaseModel.create(
      {
        body: {
          vehicle_id: chassisRecord.vehicle_id,
          vehicle_color_id: req.body.vehicle_color_id,
          customer_id: customerRecord.id,
          dealer_id: dealerId,
          chassis_no: req.body.chassis_no,
          invoices_bills: req.body.invoices_bills,
          booking_amount: req.body.booking_amount,
        },
      },
      transaction
    );

    await transaction.commit();
    res.code(200).send({ status: true, message: "Created successfully." });
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
      { body: { dealer_id: validateData.dealer_id } },
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
  update: update,
  get: get,
  assignToDealer: assignToDealer,
  createNewCustomerOrder: createNewCustomerOrder,
  createExistingCustomerOrder: createExistingCustomerOrder,
};
