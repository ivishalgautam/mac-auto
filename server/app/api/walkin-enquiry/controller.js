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

const create = async (req, res) => {
  try {
    const dealerRecord = await table.DealerModel.getByUserId(req.user_data.id);
    if (!dealerRecord)
      return res.code(404).send({ message: "Dealer not registered!" });
    req.body.dealer_id = dealerRecord.id;

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
    console.log(data);

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
  update: update,
  get: get,
  convertToCustomer: convertToCustomer,
  assignToDealer: assignToDealer,
};
