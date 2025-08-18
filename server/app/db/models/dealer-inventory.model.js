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
      vehicle_color_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_COLOR_TABLE,
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
          fields: ["vehicle_color_id"],
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

const create = async (
  { vehicle_color_id, vehicle_id, dealer_id, chassis_no },
  transaction
) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await DealerInventoryModel.create(
    {
      vehicle_color_id: vehicle_color_id,
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
    {
      chassis_no: req.body.chassis_no,
      status: req.body.status,
    },
    options
  );
};

const updateStatusByChassisNo = async (no, status, transaction) => {
  const options = {
    where: { chassis_no: no },
    returning: true,
  };
  if (transaction) options.transaction = transaction;

  const [, updatedRecords] = await DealerInventoryModel.update(
    { status: status },
    options
  );

  return updatedRecords;
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
    whereConditions.push("dlr.user_id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
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
      vh.id, vh.title, vh.description, vh.category, vh.slug, vh.carousel,
      (vh.pricing->0->>'base_price')::numeric AS starting_from,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', vhclr.id,
            'color_name', vhclr.color_name,
            'color_hex', vhclr.color_hex
          )
        ) FILTER (WHERE vh.id IS NOT NULL), '[]') as colors,
      vh.created_at,
      COUNT(DISTINCT CASE WHEN dlrinvn.status = 'active' THEN dlrinvn.id END) as active_quantity,
      COUNT(DISTINCT CASE WHEN dlrinvn.status = 'inactive' THEN dlrinvn.id END) as inactive_quantity,
      COUNT(DISTINCT CASE WHEN dlrinvn.status = 'sold' THEN dlrinvn.id END) as sold_quantity,
      COUNT(DISTINCT CASE WHEN dlrinvn.status = 'scrapped' THEN dlrinvn.id END) as scrapped_quantity
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON dlrinvn.vehicle_color_id = vhclr.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
    ${whereClause}
    GROUP BY vh.id
    ORDER BY vh.updated_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(dlrinvn.id) OVER()::integer as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
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

const getByVehicleId = async (req, vehicle_id) => {
  const whereConditions = ["invnt.vehicle_id = :vehicle_id"];
  const queryParams = { vehicle_id: vehicle_id };
  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(invnt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`invnt.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      *
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
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
  updateStatusByChassisNo: updateStatusByChassisNo,
};
