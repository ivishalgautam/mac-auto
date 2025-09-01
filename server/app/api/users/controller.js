"use strict";

import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import hash from "../../lib/encryption/index.js";
import { userSchema } from "../../validation-schema/user.schema.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = userSchema.parse(req.body);
    const record = await table.UserModel.getByUsername(req);
    if (record) {
      return res.code(409).send({
        message:
          "User already exists with this username. Please try with different username",
      });
    }

    const user = await table.UserModel.create(req, transaction);
    if (validateData.role === "dealer") {
      await table.DealerModel.create(
        {
          user_id: user.id,
          location: validateData.location,
        },
        transaction
      );
    }
    if (validateData.role === "customer") {
      await table.CustomerModel.create(user.id, transaction);
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

    if (user.role === "dealer") {
      const location = req.body.location;
      const data = await table.DealerModel.updateByUser(
        { body: { location } },
        user.id
      );
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
