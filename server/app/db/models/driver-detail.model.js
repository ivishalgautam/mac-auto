"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let DriverDetailModel = null;
const init = async (sequelize) => {
  DriverDetailModel = sequelize.define(
    constants.models.DRIVER_DETAIL_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.ORDER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      driver_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vehicle_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["driver_name"] },
        { fields: ["vehicle_number"] },
        { fields: ["phone"] },
      ],
    }
  );

  await DriverDetailModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await DriverDetailModel.create(
    {
      order_id: req.body.order_id,
      driver_name: req.body.driver_name,
      vehicle_number: req.body.vehicle_number,
      phone: req.body.phone,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await DriverDetailModel.update(
    {
      driver_name: req.body.driver_name,
      vehicle_number: req.body.vehicle_number,
      phone: req.body.phone,
    },
    options
  );

  return data.dataValues;
};

const getById = async (req, id) => {
  return await DriverDetailModel.findOne({
    where: { id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
};
