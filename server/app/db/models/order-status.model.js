"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let OrderStatusModel = null;
const init = async (sequelize) => {
  OrderStatusModel = sequelize.define(
    constants.models.ORDER_STATUS_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.ORDER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "in process",
          "completed",
          "dispatched",
          "out for delivery",
          "delivered",
          "cancel",
        ]),
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: false,
      indexes: [{ unique: true, fields: ["order_id", "status"] }],
    }
  );

  await OrderStatusModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  return await OrderStatusModel.create(
    {
      order_id: req.body.order_id,
      status: req.body.status,
    },
    { transaction: transaction }
  );
};

export default {
  init: init,
  create: create,
};
