"use strict";

import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import { generatePassword } from "../../helpers/generate-password.js";
import hash from "../../lib/encryption/index.js";
import { mailer } from "../../services/mailer.js";
import { userSchema } from "../../validation-schema/user.schema.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { role, id } = req.user_data;
    const validateData = userSchema.parse(req.body);
    if (validateData.role !== "customer") {
      const record = await table.UserModel.getByUsername(req);
      if (record) {
        return res.code(409).send({
          message:
            "User already exists with this username. Please try with different username",
        });
      }
    }

    const user = await table.UserModel.create(req, transaction);
    if (validateData.role === "dealer") {
      await table.DealerModel.create(
        {
          user_id: user.id,
          location: validateData.location,
          dealer_code: req.body.dealer_code,
          aadhaar: req.body.aadhaar,
          pan: req.body.pan,
          gst: req.body.gst,
        },
        transaction
      );
    }

    if (validateData.role === "customer") {
      const customer = await table.CustomerModel.create(user.id, transaction);
      if (role === "dealer") {
        const dealer = await table.DealerModel.getByUserId(id);
        await table.CustomerDealersModel.create(
          { body: { dealer_id: dealer.id, customer_id: customer.id } },
          transaction
        );
      }

      await mailer.sendCustomerCredentialsEmail({
        email: validateData.email,
        fullname: user.first_name + " " + user?.last_name ?? "",
        username: user.username,
        password: generatePassword(
          validateData.first_name,
          validateData.mobile_number
        ),
      });
    }

    await transaction.commit();

    res.send(user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }
    const user = await table.UserModel.update(req, 0, transaction);

    const documentsToDelete = [];
    if (user.role === "dealer") {
      // Aadhaar
      const existingAadhaarDocs = record.aadhaar;
      const updatedAadhaarDocs = req.body.aadhaar_urls;
      if (updatedAadhaarDocs) {
        req.body.aadhaar = [
          ...(req.body?.aadhaar ?? []),
          ...updatedAadhaarDocs,
        ];
        documentsToDelete.push(
          ...getItemsToDelete(existingAadhaarDocs, updatedAadhaarDocs)
        );
      }

      // PAN
      const existingPanDocs = record.pan;
      const updatedPanDocs = req.body.pan_urls;
      if (updatedPanDocs) {
        req.body.pan = [...(req.body?.pan ?? []), ...updatedPanDocs];
        documentsToDelete.push(
          ...getItemsToDelete(existingPanDocs, updatedPanDocs)
        );
      }

      // GST
      const existingGstDocs = record.gst;
      const updatedGstDocs = req.body.gst_urls;
      if (updatedGstDocs) {
        req.body.gst = [...(req.body?.gst ?? []), ...updatedGstDocs];
        documentsToDelete.push(
          ...getItemsToDelete(existingGstDocs, updatedGstDocs)
        );
      }

      const location = req.body.location;
      const data = await table.DealerModel.updateByUser(
        { body: { location, ...req.body } },
        user.id
      );
    }

    if (documentsToDelete.length) {
      await cleanupFiles(documentsToDelete);
    }

    await transaction.commit();
    return res.send({ status: true, message: "User updated successfully!" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }
    await table.UserModel.deleteById(req);
    return res.send(record);
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.UserModel.get(req);
    return res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }
    delete record.password;

    return res.send(record);
  } catch (error) {
    throw error;
  }
};

const getByPhone = async (req, res) => {
  try {
    const record = await table.UserModel.getByPhone(req.params.phone);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }
    delete record.password;

    return res.send(record);
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);

    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }

    const verify_old_password = await hash.verify(
      req.body.old_password,
      record.password
    );

    if (!verify_old_password) {
      return res
        .code(404)
        .send({ message: "Incorrect password. Please enter a valid password" });
    }

    await table.UserModel.updatePassword(req);
    return res.send({
      message: "Password changed successfully!",
    });
  } catch (error) {
    throw error;
  }
};

const checkUsername = async (req, res) => {
  try {
    const user = await table.UserModel.getByUsername(req);
    if (user) {
      return res.code(409).send({
        message: "username already exists try with different username",
      });
    }
    return res.send({
      message: false,
    });
  } catch (error) {
    throw error;
  }
};

const getUser = async (req, res) => {
  try {
    const record = await table.UserModel.getById(0, req.user_data.id);
    if (!record) {
      return res.code(401).send({ message: "unauthorized!" });
    }
    return res.send(req.user_data);
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = await table.UserModel.getByResetToken(req);
    if (!token) {
      return res.code(401).send({ message: "invalid url" });
    }

    await table.UserModel.updatePassword(req, token.id);
    return res.send({
      message: "Password reset successfully!",
    });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  getByPhone: getByPhone,
  checkUsername: checkUsername,
  updatePassword: updatePassword,
  getUser: getUser,
  resetPassword: resetPassword,
};
