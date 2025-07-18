"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let DealerInventoryModel = null;

const init = async (sequelize) => {
  DealerInventoryModel = sequelize.define(
    constants.models.DEALER_INVENTORY_TABLE,
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
      chassis_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "Chassis no. exist" },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "sold", "scrapped"),
        allowNull: false,
        defaultValue: "active",
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
          fields: ["chassis_no"],
          unique: true,
        },
      ],
    }
  );

  await DealerInventoryModel.sync({ alter: true });
};

const create = async ({ vehicle_id, dealer_id, chassis_no }, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await DealerInventoryModel.create(
    {
      vehicle_id: vehicle_id,
      dealer_id: dealer_id,
      chassis_no: chassis_no,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (data, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await DealerInventoryModel.bulkCreate(data, options);
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await DealerInventoryModel.update(
    { quantity: req.body.quantity },
    options
  );
};

const updateByDealerId = async (req, id) => {
  return await DealerInventoryModel.update(
    { quantity: req.body.quantity },
    {
      where: { dealer_id: id },
      returning: true,
      raw: true,
    }
  );
};

const updateQuantity = async (quantity, id, transaction) => {
  const options = {
    where: { id: id },
    returning: true,
    raw: true,
  };

  if (transaction) options.transaction = transaction;

  return await DealerInventoryModel.update({ quantity: quantity }, options);
};

const getById = async (id) => {
  return await DealerInventoryModel.findOne({
    where: {
      id: id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const get = async (req) => {
  const { role, id } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  if (role === "dealer") {
    whereConditions.push("dlrusr.id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(vhc.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
      dlrinv.*,
      vhc.title, vhc.category, vhc.color
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinv
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vhc ON vhc.id = dlrinv.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinv.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
    ${whereClause}
    ORDER BY dlrinv.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(dlrinv.id) OVER()::integer as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinv
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vhc ON vhc.id = dlrinv.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinv.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
    ${whereClause}
  `;

  const inventory = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory, total: count?.total ?? 0 };
};

const getByVehicleId = async (vehicle_id) => {
  return await DealerInventoryModel.findOne({
    where: { vehicle_id: vehicle_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });
};

const getByVehicleAndDealer = async (vehicle_id, dealer_id) => {
  return await DealerInventoryModel.findOne({
    where: { vehicle_id: vehicle_id, dealer_id: dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });
};

const deleteByVehicleId = async (vehicle_id) => {
  return await DealerInventoryModel.destroy({
    where: { vehicle_id: vehicle_id },
  });
};

const deleteById = async (id) => {
  return await DealerInventoryModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  update: update,
  getById: getById,
  get: get,
  getByVehicleId: getByVehicleId,
  deleteByVehicleId: deleteByVehicleId,
  deleteById: deleteById,
  updateQuantity: updateQuantity,
  updateByDealerId: updateByDealerId,
  getByVehicleAndDealer: getByVehicleAndDealer,
};
