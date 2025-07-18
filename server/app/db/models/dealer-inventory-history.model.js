"use strict";

import moment from "moment";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable } from "sequelize";

let DealerInventoryHistoryModel = null;

const init = async (sequelize) => {
  DealerInventoryHistoryModel = sequelize.define(
    constants.models.DEALER_INVENTORY_HISTORY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      dealer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.DEALER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      previous_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null for initial entries
      },
      new_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity_change: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      change_type: {
        type: DataTypes.ENUM,
        values: ["INCREASE", "DECREASE", "INITIAL", "ADJUSTMENT"],
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["vehicle_id"],
        },
        {
          fields: ["dealer_id"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["change_type"],
        },
      ],
    }
  );

  await DealerInventoryHistoryModel.sync({ alter: true });
};

const create = async (
  { vehicle_id, dealer_id, previous_quantity, new_quantity, change_type },
  transaction
) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const quantity_change = previous_quantity
    ? new_quantity - previous_quantity
    : new_quantity;

  const data = await DealerInventoryHistoryModel.create(
    {
      vehicle_id,
      dealer_id,
      previous_quantity,
      new_quantity,
      quantity_change,
      change_type,
    },
    options
  );

  return data.dataValues;
};

const getByVehicleId = async (vehicle_id, options = {}) => {
  const queryOptions = {
    where: { vehicle_id },
    order: [["created_at", "DESC"]],
    raw: true,
    ...options,
  };

  return await DealerInventoryHistoryModel.findAll(queryOptions);
};

const getByDealerId = async (dealer_id, options = {}) => {
  const queryOptions = {
    where: { dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
    ...options,
  };

  return await DealerInventoryHistoryModel.findAll(queryOptions);
};

const getByVehicleAndDealer = async (vehicle_id, dealer_id, options = {}) => {
  const queryOptions = {
    where: { vehicle_id, dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
    ...options,
  };

  return await DealerInventoryHistoryModel.findAll(queryOptions);
};

const getByDateRange = async (startDate, endDate, options = {}) => {
  const queryOptions = {
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["created_at", "DESC"]],
    raw: true,
    ...options,
  };

  return await DealerInventoryHistoryModel.findAll(queryOptions);
};

const getByChangeType = async (change_type, options = {}) => {
  const queryOptions = {
    where: { change_type },
    order: [["created_at", "DESC"]],
    raw: true,
    ...options,
  };

  return await DealerInventoryHistoryModel.findAll(queryOptions);
};

const getLatestByInventoryId = async (inventory_id) => {
  return await DealerInventoryHistoryModel.findOne({
    where: { inventory_id },
    order: [["created_at", "DESC"]],
    raw: true,
    plain: true,
  });
};

const deleteByInventoryId = async (inventory_id) => {
  return await DealerInventoryHistoryModel.destroy({
    where: { inventory_id },
  });
};

const deleteOldRecords = async (daysToKeep = 365) => {
  const cutoffDate = moment().subtract(daysToKeep, "days").toDate();

  return await DealerInventoryHistoryModel.destroy({
    where: {
      created_at: {
        [Op.lt]: cutoffDate,
      },
    },
  });
};

export default {
  init: init,
  create: create,
  getByVehicleId: getByVehicleId,
  getByDealerId: getByDealerId,
  getByVehicleAndDealer: getByVehicleAndDealer,
  getByDateRange: getByDateRange,
  getByChangeType: getByChangeType,
  getLatestByInventoryId: getLatestByInventoryId,
  deleteByInventoryId: deleteByInventoryId,
  deleteOldRecords: deleteOldRecords,
};
