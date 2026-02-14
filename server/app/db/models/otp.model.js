"use strict";
import moment from "moment";
import constants from "../../lib/constants/index.js";
import { DataTypes } from "sequelize";

let OTPModel = null;

const init = async (sequelize) => {
  OTPModel = sequelize.define(
    constants.models.OTP_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
        },
        onDelete: "CASCADE",
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("login", "register"),
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return OTPModel;
  await OTPModel.sync({ alter: true });
};

const create = async ({ mobile_number, otp, type, user_id = null }) => {
  const data = await OTPModel.create({
    otp: otp,
    mobile_number: mobile_number,
    type: type,
    user_id: user_id,
    expires_at: moment().add(5, "minutes"),
  });

  return data.dataValues;
};

const update = async (req, id) => {
  return await OTPModel.update(
    {
      otp: req.body.otp,
      verified: req.body.verified,
      expires_at: moment().add(5, "minutes"),
    },
    {
      where: { id: id },
      returning: true,
      raw: true,
    }
  );
};

const getById = async (id) => {
  return await OTPModel.findOne({
    where: {
      id: id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteByMobileNumber = async (mobile_number) => {
  return await OTPModel.destroy({
    where: { mobile_number: mobile_number },
  });
};

const deleteById = async (id) => {
  return await OTPModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  deleteByMobileNumber: deleteByMobileNumber,
  deleteById: deleteById,
};
